-- Create verification_codes table for 2FA and password reset
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('signup', 'password_reset')),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(email, type, code)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_type 
ON verification_codes(email, type);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at 
ON verification_codes(expires_at);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert verification codes (needed for signup)
CREATE POLICY "Anyone can insert verification codes"
ON verification_codes FOR INSERT
WITH CHECK (true);

-- Allow anyone to read their own verification codes
CREATE POLICY "Users can read their own verification codes"
ON verification_codes FOR SELECT
USING (true);

-- Allow anyone to delete their own verification codes
CREATE POLICY "Users can delete their own verification codes"
ON verification_codes FOR DELETE
USING (true);

-- Automatically delete expired codes (run via cron)
-- You can set up a scheduled function in Supabase to clean expired codes
CREATE OR REPLACE FUNCTION delete_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
