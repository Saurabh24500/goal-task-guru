import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase, signIn, signUp, sendVerificationCode, verifyCode, resetPassword } from '@/lib/supabase';
import { Mail, Phone, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { 
  PasswordStrengthIndicator, 
  validatePasswordStrength, 
  LoginLockoutNotice 
} from '@/components/AuthComponents';
import ThemeToggle from '@/components/ThemeToggle';

const LOGIN_ATTEMPT_KEY = 'login_attempts';
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

const SIGNUP_COOLDOWN_KEY = 'signup_cooldown';
const SIGNUP_COOLDOWN_DURATION = 30 * 1000; // 30 seconds in milliseconds

const Login = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(true); // Start with signup only
  const [inputType, setInputType] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingLockTime, setRemainingLockTime] = useState(0);
  const [signupCooldown, setSignupCooldown] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'code' | 'reset'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(0);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  // Check login lockout status
  useEffect(() => {
    const checkLockout = () => {
      const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPT_KEY) || '[]');
      const now = Date.now();
      
      // Remove old attempts (older than lockout duration)
      const validAttempts = attempts.filter((timestamp: number) => now - timestamp < LOCKOUT_DURATION);
      localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(validAttempts));

      if (validAttempts.length >= MAX_LOGIN_ATTEMPTS) {
        const oldestAttempt = validAttempts[0];
        const timeLeft = LOCKOUT_DURATION - (now - oldestAttempt);
        setIsLocked(true);
        setRemainingLockTime(Math.ceil(timeLeft / 1000));
      } else {
        setIsLocked(false);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (!isLocked || remainingLockTime <= 0) return;

    const timer = setTimeout(() => {
      setRemainingLockTime(remainingLockTime - 1);
      if (remainingLockTime - 1 <= 0) {
        setIsLocked(false);
        localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify([]));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLocked, remainingLockTime]);

  // Check signup cooldown status
  useEffect(() => {
    const checkSignupCooldown = () => {
      const lastSignupTime = localStorage.getItem(SIGNUP_COOLDOWN_KEY);
      if (!lastSignupTime) {
        setSignupCooldown(0);
        return;
      }

      const now = Date.now();
      const timeSinceLastSignup = now - parseInt(lastSignupTime);
      const timeRemaining = Math.max(0, SIGNUP_COOLDOWN_DURATION - timeSinceLastSignup);

      if (timeRemaining > 0) {
        setSignupCooldown(Math.ceil(timeRemaining / 1000));
      } else {
        setSignupCooldown(0);
        localStorage.removeItem(SIGNUP_COOLDOWN_KEY);
      }
    };

    checkSignupCooldown();
    const interval = setInterval(checkSignupCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const recordFailedAttempt = () => {
    const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPT_KEY) || '[]');
    attempts.push(Date.now());
    localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(attempts));

    if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
      setIsLocked(true);
      setRemainingLockTime(Math.ceil(LOCKOUT_DURATION / 1000));
    }
  };

  // Handle forgot password - send code
  const handleForgotPasswordSendCode = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (!resetEmail) {
        setError('Please enter your email');
        setLoading(false);
        return;
      }

      const res = await sendVerificationCode(resetEmail, 'password_reset');
      if (res.error) throw res.error;

      setForgotPasswordStep('code');
      setCodeExpiry(300); // 5 minutes
      setError('');
      console.log('✅ Password reset code sent to ' + resetEmail);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle code expiry timer
  useEffect(() => {
    if (codeExpiry <= 0 || forgotPasswordStep !== 'code') return;

    const timer = setTimeout(() => {
      setCodeExpiry(codeExpiry - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [codeExpiry, forgotPasswordStep]);

  // Verify password reset code
  const handleVerifyResetCode = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (!resetCode) {
        setError('Please enter the verification code');
        setLoading(false);
        return;
      }

      const res = await verifyCode(resetEmail, resetCode, 'password_reset');
      if (res.error) throw res.error;

      setForgotPasswordStep('reset');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password with new password
  const handleResetPassword = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (!newPassword || !confirmPassword) {
        setError('Please fill in all password fields');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const strength = validatePasswordStrength(newPassword);
      if (!strength.isStrong) {
        setError('Password is not strong enough. Please meet all requirements.');
        setLoading(false);
        return;
      }

      const res = await resetPassword(resetEmail, newPassword);
      if (res.error) throw res.error;

      setError('');
      setShowForgotPassword(false);
      setForgotPasswordStep('email');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      alert('✅ Password reset successfully! You can now login with your new password.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    
    try {
      const identifier = inputType === 'email' ? email : phone;
      
      if (!identifier || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (isRegister) {
        // SIGNUP - With cooldown to prevent rate limiting
        if (signupCooldown > 0) {
          setError(`Please wait ${signupCooldown} second${signupCooldown !== 1 ? 's' : ''} before signing up again.`);
          setLoading(false);
          return;
        }

        if (!name) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }

        // Validate password strength
        const strength = validatePasswordStrength(password);
        if (!strength.isStrong) {
          setError('Password is not strong enough. Please meet all requirements.');
          setLoading(false);
          return;
        }

        try {
          const res = await signUp(identifier, password, { 
            data: { 
              name,
              phone: inputType === 'phone' ? phone : null,
              email: inputType === 'email' ? email : null,
            } 
          });
          if ((res as any).error) throw (res as any).error;
          
          // Send verification code to user
          const codeRes = await sendVerificationCode(identifier, 'signup');
          if (codeRes.error) throw codeRes.error;

          // Record successful signup attempt with cooldown
          localStorage.setItem(SIGNUP_COOLDOWN_KEY, Date.now().toString());
          setSignupCooldown(Math.ceil(SIGNUP_COOLDOWN_DURATION / 1000));

          setError('');
          setTwoFactorEmail(inputType === 'email' ? email : phone);
          setShowTwoFactor(true);
          setEmail('');
          setPhone('');
          setPassword('');
          setName('');
        } catch (err: any) {
          if (err.message?.includes('exist')) {
            setError('This email/phone is already registered. Please sign in instead.');
          } else {
            setError(err.message || 'Signup failed. Please try again.');
          }
        }
      } else {
        // LOGIN - Only allowed after successful signup
        if (!signupSuccess) {
          setError('❌ You must sign up first before you can login. Create an account to get started!');
          setLoading(false);
          return;
        }

        if (isLocked) {
          setError(`Too many failed attempts. Please wait ${Math.ceil(remainingLockTime / 60)} minute(s) before trying again.`);
          setLoading(false);
          return;
        }

        try {
          const res = await signIn(identifier, password);
          if ((res as any).error) throw (res as any).error;
          
          // Clear lockout on successful login
          localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify([]));
          setIsLocked(false);
          navigate('/');
        } catch (err: any) {
          recordFailedAttempt();
          
          if (err.message?.includes('rate')) {
            setError('Too many login attempts. Please wait a few minutes.');
          } else if (err.message?.includes('Invalid login credentials')) {
            const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPT_KEY) || '[]');
            const remaining = MAX_LOGIN_ATTEMPTS - attempts.length;
            setError(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
          } else if (err.message?.includes('not found') || err.message?.includes('not exist')) {
            setError('Email or phone not registered. Please sign up first.');
          } else {
            setError(err.message || 'Login failed. Please try again.');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorVerify = async (code: string) => {
    setLoading(true);
    try {
      const res = await verifyCode(twoFactorEmail, code, 'signup');
      if (res.error) throw res.error;

      alert('✅ Account created successfully! Now you can login.');
      setShowTwoFactor(false);
      setSignupSuccess(true);
      setIsRegister(false);
      setEmail(twoFactorEmail);
      setPhone('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Code verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorResend = async () => {
    try {
      const res = await sendVerificationCode(twoFactorEmail, 'signup');
      if (res.error) throw res.error;
      alert('✅ Verification code resent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-950 via-purple-900 to-pink-900 flex items-center justify-center cursor-custom">
      {/* Animated Background with Gradient */}
      <AnimatedBackground />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 animate-fade-in hover:border-white/40 transition-all duration-500" style={{
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.2), 0 0 60px rgba(168, 85, 247, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
        }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 animate-slide-in">
            <div className="p-2.5 bg-gradient-to-r from-blue-400 to-pink-400 rounded-lg animate-glow" style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
            }}>
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-pink-300 bg-clip-text text-transparent">Goal Task Guru</h1>
              <p className="text-xs text-blue-200">Productivity & Goal Tracking</p>
            </div>
          </div>

          {/* Lockout Notice */}
          {isLocked && !isRegister && (
            <LoginLockoutNotice isLocked={isLocked} remainingTime={remainingLockTime} />
          )}

          {/* Tabs - Only show after signup */}
          {!showTwoFactor && (
            <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-lg border border-white/20">
              <button
                onClick={() => setIsRegister(false)}
                disabled={!signupSuccess}
                className={`flex-1 py-2 rounded transition-all font-medium text-sm ${
                  !isRegister && signupSuccess
                    ? 'bg-gradient-to-r from-blue-400 to-pink-400 text-white shadow-lg'
                    : signupSuccess ? 'text-white/70 hover:text-white' : 'text-white/40 cursor-not-allowed'
                }`}
              >
                Sign In {!signupSuccess && '(Create Account First)'}
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-2 rounded transition-all font-medium text-sm ${
                  isRegister
                    ? 'bg-gradient-to-r from-blue-400 to-pink-400 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && !showTwoFactor && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-100 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Two Factor Form */}
          {showTwoFactor ? (
            <TwoFactorVerification
              isOpen={showTwoFactor}
              email={twoFactorEmail}
              onVerify={handleTwoFactorVerify}
              onResend={handleTwoFactorResend}
              loading={loading}
            />
          ) : (
            <>
              {/* Form Fields */}
              <div className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="text-xs font-medium text-white mb-1.5 block">Your Name</label>
                    <Input
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="bg-white/20 border border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-blue-300 focus:outline-none transition-all duration-300"
                      style={{
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </div>
                )}

                {/* Input Type Toggle */}
                {!isLocked && (
                  <div>
                    <label className="text-xs font-medium text-white mb-2 block">Login Method</label>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setInputType('email')}
                        className={`flex-1 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          inputType === 'email'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        <Mail className="w-4 h-4" /> Email
                      </button>
                      <button
                        onClick={() => setInputType('phone')}
                        className={`flex-1 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          inputType === 'phone'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        <Phone className="w-4 h-4" /> Phone
                      </button>
                    </div>
                  </div>
                )}

                {inputType === 'email' ? (
                  <div>
                    <label className="text-xs font-medium text-white mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || isLocked}
                        className="bg-white/20 border border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-blue-300 focus:outline-none pl-9 transition-all duration-300"
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-white mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading || isLocked}
                        className="bg-white/20 border border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-pink-300 focus:outline-none pl-9 transition-all duration-300"
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-white mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                      disabled={loading || isLocked}
                        className="bg-white/20 border border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-purple-300 focus:outline-none pl-9 transition-all duration-300"
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                  </div>
                </div>

                {/* Password Strength Indicator for Signup */}
                {isRegister && <PasswordStrengthIndicator password={password} isVisible={password.length > 0} />}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleAuth}
                disabled={loading || isLocked || (!signupSuccess && !isRegister)}
                className="w-full mt-6 bg-gradient-to-r from-blue-400 to-pink-400 hover:from-blue-500 hover:to-pink-500 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                size="lg"
              >
                {loading ? (
                  'Loading...'
                ) : isLocked ? (
                  `Try Again in ${Math.ceil(remainingLockTime / 60)}m`
                ) : (
                  <>
                    {isRegister ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Footer Text */}
              <p className="text-center text-xs text-white/80 mt-6">
                {isRegister
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="text-blue-200 font-semibold hover:text-blue-100 underline"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </button>
              </p>

              {/* Forgot Password Link - Only show on login */}
              {!isRegister && signupSuccess && (
                <p className="text-center text-xs">
                  <button
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                    }}
                    className="text-blue-200 font-semibold hover:text-blue-100 underline"
                  >
                    Forgot Password?
                  </button>
                </p>
              )}
            </>
          )}
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter your email and we'll send you a code to reset your password.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-100 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
            {forgotPasswordStep === 'email' && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={loading}
                    className="bg-background"
                  />
                </div>
                <Button onClick={handleForgotPasswordSendCode} disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </>
            )}

            {forgotPasswordStep === 'code' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Code expires in:</span>
                  <span className={`font-bold ${codeExpiry <= 60 ? 'text-orange-600' : 'text-green-600'}`}>
                    {Math.floor(codeExpiry / 60)}:{(codeExpiry % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  className="text-center text-2xl bg-background"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyResetCode}
                    disabled={loading || resetCode.length !== 6}
                    className="flex-1"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  <Button
                    onClick={handleForgotPasswordSendCode}
                    variant="outline"
                    disabled={loading}
                  >
                    Resend
                  </Button>
                </div>
              </>
            )}

            {forgotPasswordStep === 'reset' && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="bg-background"
                  />
                </div>
                {newPassword && <PasswordStrengthIndicator password={newPassword} isVisible={true} />}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="bg-background"
                  />
                </div>
                <Button onClick={handleResetPassword} disabled={loading} className="w-full">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Decorative Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-white/80">
            Track your goals, manage tasks, and stay inspired 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

const AnimatedBackground = () => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    {/* Animated blob top-left */}
    <svg
      className="absolute -left-40 -top-40 opacity-40 animate-pulse"
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <circle cx="300" cy="300" r="200" fill="url(#g1)" opacity="0.6">
        <animate attributeName="r" values="180;280;180" dur="12s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="12s" repeatCount="indefinite" />
      </circle>
    </svg>

    {/* Animated blob bottom-right */}
    <svg
      className="absolute right-0 bottom-0 opacity-40 animate-pulse"
      width="500"
      height="500"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="g2" x1="1" x2="0">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="250" cy="250" r="160" fill="url(#g2)" opacity="0.6">
        <animate attributeName="r" values="150;250;150" dur="10s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="10s" repeatCount="indefinite" />
      </circle>
    </svg>

    {/* Glow effect center */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{
      animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }} />

    {/* Additional glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-pink-500/5 animate-pulse" />
  </div>
);

export default Login;
