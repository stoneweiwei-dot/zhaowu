import { supabase } from "@/lib/supabase";

export const authEnabled = true;

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
}

export async function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
}

export async function sendMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: `${window.location.origin}/account` },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}
