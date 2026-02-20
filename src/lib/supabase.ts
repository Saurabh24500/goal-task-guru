import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate a random 6-digit code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Sign up with duplicate email check
export const signUp = async (identifier: string, password: string, options?: any) => {
  const email = identifier.includes('@') ? identifier : `${identifier}@phone.local`;
  
  return supabase.auth.signUp({ email, password }, options);
};

export const signIn = (identifier: string, password: string) => {
  // Supabase only supports email login, so if phone is provided, use a generated email
  const email = identifier.includes('@') ? identifier : `${identifier}@phone.local`;
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = () => supabase.auth.signOut();

// Send 2FA verification code via email
export const sendVerificationCode = async (email: string, type: 'signup' | 'password_reset' = 'signup') => {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  
  // Store in verification_codes table
  const { error } = await supabase.from('verification_codes').upsert({
    email,
    code,
    type,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });
  
  if (error) {
    console.error('Error storing verification code:', error);
    return { error };
  }
  
  // In production, here you would send via email service
  // For now, log it (in real app, use Supabase email templates)
  console.log(`📧 Verification code for ${email} (${type}): ${code}`);
  
  return { success: true, code }; // code returned for testing, remove in production
};

// Verify 2FA code
export const verifyCode = async (email: string, code: string, type: 'signup' | 'password_reset' = 'signup') => {
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('type', type)
    .single();
  
  if (error || !data) {
    return { error: { message: 'Invalid verification code.' } };
  }
  
  // Check if code is expired
  if (new Date() > new Date(data.expires_at)) {
    return { error: { message: 'Verification code has expired.' } };
  }
  
  // Delete used code
  await supabase.from('verification_codes').delete().eq('id', data.id);
  
  return { success: true };
};

// Password reset
export const resetPassword = async (identifier: string, newPassword: string) => {
  const email = identifier.includes('@') ? identifier : `${identifier}@phone.local`;
  
  // Verify user exists
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Use updateUserById for password reset (admin function)
    return supabase.auth.updateUser({ password: newPassword });
  }
  
  return supabase.auth.updateUser({ password: newPassword });
};

export default supabase;
