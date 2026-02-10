import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase, signIn, signUp } from '@/lib/supabase';

const Login = () => {
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(emailOrPhone, password, { data: { name } });
        alert('Confirmation email sent if using email.');
      } else {
        const res = await signIn(emailOrPhone, password);
        if ((res as any).error) throw (res as any).error;
        navigate('/');
      }
    } catch (err: any) {
      alert(err.message || 'Auth error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 relative overflow-hidden">
      <AnimatedBackground />
      <div className="z-10 w-full max-w-md p-8 bg-card/80 backdrop-blur rounded-2xl border border-border shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">{isRegister ? 'Create account' : 'Sign in'}</h2>
        {isRegister && (
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="mb-3" />
        )}
        <Input placeholder="Email or mobile" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} className="mb-3" />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4" />
        <div className="flex gap-2">
          <Button onClick={handleAuth} className="flex-1">{isRegister ? 'Register' : 'Sign in'}</Button>
          <Button variant="ghost" onClick={() => setIsRegister(!isRegister)}>{isRegister ? 'Have account?' : 'Create'}</Button>
        </div>
      </div>
    </div>
  );
};

const AnimatedBackground = () => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    <svg className="absolute -left-20 top-10 opacity-30" width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx="300" cy="300" r="200" fill="url(#g1)">
        <animate attributeName="r" values="180;210;180" dur="8s" repeatCount="indefinite" />
      </circle>
    </svg>
    <svg className="absolute right-0 bottom-0 opacity-20" width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="250" cy="250" r="160" fill="#f97316">
        <animate attributeName="r" values="150;170;150" dur="10s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

export default Login;
