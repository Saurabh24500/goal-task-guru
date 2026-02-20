import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

const THEME_KEY = 'theme_pref';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'default';
    } catch {
      return 'default';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-oro');
    root.classList.remove('dark');
    if (theme === 'theme-oro') root.classList.add('theme-oro');
    if (theme === 'dark') root.classList.add('dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = () => {
    if (theme === 'default') setTheme('theme-oro');
    else if (theme === 'theme-oro') setTheme('dark');
    else setTheme('default');
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="px-2">
      {theme === 'theme-oro' ? <Sun className="w-4 h-4 text-yellow-300" /> : theme === 'dark' ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-orange-400" />}
    </Button>
  );
}
