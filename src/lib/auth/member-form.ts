export type MemberMode = "login" | "signup" | "forgot" | "reset";
export type MemberFormError = "INVALID_EMAIL" | "INVALID_PASSWORD" | "PASSWORD_MISMATCH";

// Match visitor-signup's existing validation instead of relying on transient browser bubbles.
const EMAIL_SHAPE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export function validateMemberForm(mode: MemberMode, email: string, password: string, confirmation: string): MemberFormError | null {
  if (mode !== "reset" && !EMAIL_SHAPE.test(email.trim())) return "INVALID_EMAIL";
  if (mode === "forgot") return null;
  if (password.length < 8 || password.length > 72) return "INVALID_PASSWORD";
  if (mode === "reset" && password !== confirmation) return "PASSWORD_MISMATCH";
  return null;
}
