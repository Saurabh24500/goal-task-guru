import { useEffect, useState } from 'react';

interface Props {
  text?: string;
}

export default function AnimatedBanner({ text = 'a life changing....' }: Props) {
  const [visibleText, setVisibleText] = useState('');
  const [offset, setOffset] = useState(-40);

  useEffect(() => {
    // slide in
    const slide = setInterval(() => {
      setOffset((o) => {
        if (o >= 0) {
          clearInterval(slide);
          return 0;
        }
        return o + 2;
      });
    }, 12);

    return () => clearInterval(slide);
  }, []);

  useEffect(() => {
    // typing effect
    let i = 0;
    const t = setInterval(() => {
      setVisibleText((s) => s + text[i]);
      i += 1;
      if (i >= text.length) clearInterval(t);
    }, 80);
    return () => clearInterval(t);
  }, [text]);

  return (
    <div
      style={{ transform: `translateY(${offset}px)` }}
      className="w-full flex items-center justify-center mt-6 pointer-events-none select-none"
    >
      <div className="px-6 py-3 rounded-full bg-black/70 text-yellow-300 font-semibold text-lg tracking-wide drop-shadow-lg animate-slide-in">
        <span className="inline-block mr-3" style={{ transform: 'translateX(-6px)' }}>
          ✨
        </span>
        {visibleText}
      </div>
    </div>
  );
}
