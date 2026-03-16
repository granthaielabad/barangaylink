// src/services/supabase/authService.js
import { supabase } from './client';

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const profile = await getMyProfile(data.session.user.id);
  return { session: data.session, profile };
}

/**
 * Step 3 of signup — called after OTP is verified (session already exists).
 * Sets the password and writes full_name into the profile row.
 */
export async function signUp({ email, password, fullName, role = 'resident' }) {
  // 1. Set the password on the existing auth.users row
  const { data, error } = await supabase.auth.updateUser({
    password,
    data: { full_name: fullName, role }, // stored in raw_user_meta_data
  });
  if (error) throw error;

  // 2. Upsert the profile row — fills in full_name which was NULL
  //    when the trigger first fired (at OTP send time).
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      { id: data.user.id, full_name: fullName, role, consent_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  if (profileError) throw profileError;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, avatar_url, purok_id, is_active')
    .eq('id', userId)
    .maybeSingle();  // returns null instead of throwing 406 when row is missing
  if (error) throw error;
  if (!data) throw new Error('Profile not found. Please log in again.');
  return data;
}

/**
 * Sign Up flow — sends OTP to a new (unregistered) email.
 * shouldCreateUser: true creates the auth.users row immediately,
 * which fires fn_handle_new_user and creates the profiles row.
 */
export async function sendSignupOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

/**
 * Forgot Password flow — OTP for existing users only.
 * shouldCreateUser: false rejects unknown emails.
 */
export async function sendOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) throw error;
}

export async function verifyOtp({ email, otp }) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}