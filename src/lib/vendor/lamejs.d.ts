declare const lamejs: {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => {
    encodeBuffer: (left: Int16Array, right?: Int16Array) => Int8Array;
    flush: () => Int8Array;
  };
};
export const Mp3Encoder: typeof lamejs.Mp3Encoder;
export default lamejs;
