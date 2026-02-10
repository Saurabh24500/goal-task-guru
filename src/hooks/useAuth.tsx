import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const s = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    // initialize
    const session = supabase.auth.getSession().then(r => setUser((r as any).data.session?.user ?? null));
    return () => {
      s.subscription.unsubscribe();
    };
  }, []);

  return { user };
};

export default useAuth;
