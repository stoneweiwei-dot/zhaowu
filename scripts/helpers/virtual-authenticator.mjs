import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";

// A tiny virtual authenticator (software Face ID) that speaks just enough WebAuthn for "none" attestation + ES256.
export const sha256 = (data) => createHash("sha256").update(data).digest();
export const DEFAULT_ORIGIN = "https://zhaowu.test";
export const b64 = (buffer) => Buffer.from(buffer).toString("base64url");

function cborBytes(bytes) {
  return bytes.length < 256 ? Buffer.concat([Buffer.from([0x58, bytes.length]), bytes]) : Buffer.concat([Buffer.from([0x59, bytes.length >> 8, bytes.length & 255]), bytes]);
}
function cborText(text) {
  return Buffer.concat([Buffer.from([0x60 + text.length]), Buffer.from(text, "utf8")]);
}
export function createAuthenticator() {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const jwk = publicKey.export({ format: "jwk" });
  const x = Buffer.from(jwk.x, "base64url");
  const y = Buffer.from(jwk.y, "base64url");
  const cose = Buffer.concat([Buffer.from([0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01, 0x21]), cborBytes(x), Buffer.from([0x22]), cborBytes(y)]);
  const credentialId = randomBytes(32);
  let counter = 0;
  const flagsBuffer = (flags, count) => Buffer.concat([Buffer.from([flags]), Buffer.from([count >>> 24, (count >>> 16) & 255, (count >>> 8) & 255, count & 255])]);

  return {
    credentialId: b64(credentialId),
    register(options, { origin = DEFAULT_ORIGIN, flags = 0x45 } = {}) {
      const clientData = Buffer.from(JSON.stringify({ type: "webauthn.create", challenge: options.challenge, origin, crossOrigin: false }));
      const credentialData = Buffer.concat([Buffer.alloc(16), Buffer.from([credentialId.length >> 8, credentialId.length & 255]), credentialId, cose]);
      const authData = Buffer.concat([sha256(options.rp.id), flagsBuffer(flags, counter), credentialData]);
      const attestation = Buffer.concat([
        Buffer.from([0xa3]), cborText("fmt"), cborText("none"), cborText("attStmt"), Buffer.from([0xa0]), cborText("authData"), cborBytes(authData),
      ]);
      return {
        id: b64(credentialId),
        rawId: b64(credentialId),
        type: "public-key",
        response: { clientDataJSON: b64(clientData), attestationObject: b64(attestation), transports: ["internal"] },
        clientExtensionResults: {},
      };
    },
    authenticate(options, { origin = DEFAULT_ORIGIN, flags = 0x05, challenge = options.challenge } = {}) {
      counter += 1;
      const clientData = Buffer.from(JSON.stringify({ type: "webauthn.get", challenge, origin, crossOrigin: false }));
      const authData = Buffer.concat([sha256(options.rpId), flagsBuffer(flags, counter)]);
      const signature = sign("sha256", Buffer.concat([authData, sha256(clientData)]), privateKey);
      return {
        id: b64(credentialId),
        rawId: b64(credentialId),
        type: "public-key",
        response: { clientDataJSON: b64(clientData), authenticatorData: b64(authData), signature: b64(signature), userHandle: b64("zhaowu-owner") },
        clientExtensionResults: {},
      };
    },
    get counter() { return counter; },
  };
}

