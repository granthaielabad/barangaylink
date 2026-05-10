// Checks if an email is already registered in the system (auth.users)
// via a secure SECURITY DEFINER RPC function.
import { supabase } from './client';

export async function isEmailRegistered(email) {
  const { data, error } = await supabase.rpc('is_email_registered', {
    p_email: email.trim().toLowerCase(),
  });
  
  if (error) {
    console.error('Error checking email registration:', error);
    // Fallback to false so we don't block registration if the RPC is missing,
    // but log the error for developers.
    return false; 
  }
  
  return !!data;
}
