import { useEffect, useRef } from 'react';

const NUM_BLOBS = 6;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const HomeBackground = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const blobs = blobsRef.current;
    const cursor = cursorRef.current!;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const targets = new Array(NUM_BLOBS).fill(0).map(() => ({ x: mouseX + rand(-200, 200), y: mouseY + rand(-200, 200) }));

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // move cursor
      cursor.style.transform = `translate3d(${mouseX - 12}px, ${mouseY - 12}px, 0)`;
      // update targets for blobs with slight offsets
      targets.forEach((t, i) => {
        t.x = mouseX + (i - NUM_BLOBS / 2) * 20 + rand(-120, 120);
        t.y = mouseY + (i - NUM_BLOBS / 2) * 12 + rand(-80, 80);
      });
    };

    window.addEventListener('mousemove', onMove);

    let raf = 0;

    const animate = () => {
      blobs.forEach((b, i) => {
        const t = targets[i];
        if (!t) return;
        // current transform from style
        const style = b.style.transform || 'translate3d(0px,0px,0)';
        const m = style.match(/translate3d\(([-0-9.]+)px,\s*([-0-9.]+)px,\s*0\)/);
        const cx = m ? parseFloat(m[1]) : 0;
        const cy = m ? parseFloat(m[2]) : 0;
        const nx = cx + (t.x - cx) * (0.06 + i * 0.01) + Math.sin(Date.now() / (1000 + i * 200)) * 0.6 * (i + 1);
        const ny = cy + (t.y - cy) * (0.06 + i * 0.01) + Math.cos(Date.now() / (1200 + i * 300)) * 0.6 * (i + 1);
        b.style.transform = `translate3d(${nx}px, ${ny}px, 0) scale(${1 + i * 0.04})`;
      });

      raf = requestAnimationFrame(animate);
    };

    // initialize positions
    blobs.forEach((b, i) => {
      const x = window.innerWidth / 2 + (i - NUM_BLOBS / 2) * 60;
      const y = window.innerHeight / 2 + (i - NUM_BLOBS / 2) * 40;
      b.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 + i * 0.04})`;
    });

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="home-bg fixed inset-0 pointer-events-none -z-10">
      {new Array(NUM_BLOBS).fill(0).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) blobsRef.current[i] = el; }}
          className={`blob blob-${i}`}
        />
      ))}
      <div ref={cursorRef} className="cursor-follower" />
    </div>
  );
};

export default HomeBackground;
