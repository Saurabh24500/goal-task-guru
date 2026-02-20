import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('One uppercase letter (A-Z)');
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('One lowercase letter (a-z)');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('One number (0-9)');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('One special character (!@#$%^&*)');
  }

  return {
    score: Math.min(score, 4),
    feedback: feedback.slice(0, 4 - score),
    isStrong: score >= 4,
  };
};

export const PasswordStrengthIndicator = ({ password, isVisible = true }: { password: string; isVisible?: boolean }) => {
  const strength = validatePasswordStrength(password);

  if (!isVisible || !password) return null;

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${colors[strength.score]}`}
            style={{ width: `${(strength.score + 1) * 25}%` }}
          />
        </div>
        <span className="text-xs font-medium text-foreground w-12">{labels[strength.score]}</span>
      </div>
      {strength.feedback.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {item}
            </div>
          ))}
        </div>
      )}
      {strength.isStrong && (
        <div className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Strong password!
        </div>
      )}
    </div>
  );
};

interface TwoFactorVerificationProps {
  isOpen: boolean;
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading: boolean;
  expiryTime?: number; // in seconds
}

export const TwoFactorVerification = ({
  isOpen,
  email,
  onVerify,
  onResend,
  loading,
  expiryTime = 300,
}: TwoFactorVerificationProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [expiry, setExpiry] = useState(expiryTime);

  useEffect(() => {
    if (isOpen) {
      setExpiry(expiryTime);
    }
  }, [isOpen, expiryTime]);

  useEffect(() => {
    if (expiry > 0) {
      const timer = setTimeout(() => setExpiry(expiry - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [expiry]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    if (expiry <= 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }
    setError('');
    await onVerify(code);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      await onResend();
      setCode('');
      setResendCountdown(60);
      setExpiry(expiryTime);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            A 6-digit verification code has been sent to {email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Code expires in:</span>
            <span className={`text-lg font-bold ${expiry <= 60 ? 'text-orange-600' : 'text-green-600'}`}>
              {Math.floor(expiry / 60)}:{(expiry % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Verification Code
            </label>
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl letter-spacing-2 bg-background"
              disabled={loading || expiry <= 0}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resendLoading || resendCountdown > 0}
            >
              {resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : 'Resend Code'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface LoginLockoutProps {
  isLocked: boolean;
  remainingTime: number;
}

export const LoginLockoutNotice = ({ isLocked, remainingTime }: LoginLockoutProps) => {
  if (!isLocked) return null;

  const minutes = Math.ceil(remainingTime / 60);

  return (
    <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <h3 className="font-semibold text-destructive">Account Temporarily Locked</h3>
      </div>
      <p className="text-sm text-destructive/80">
        Too many failed login attempts. Please try again in{' '}
        <span className="font-bold">{minutes} minute{minutes !== 1 ? 's' : ''}</span>.
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
