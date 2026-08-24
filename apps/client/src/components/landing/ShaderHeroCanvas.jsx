import React, { useEffect, useRef } from 'react';

/**
 * Animated mesh gradient background — organic color blobs that drift slowly.
 * Mouse-reactive with spring-like interpolation (Emil: never tie directly to mouse).
 * Renders brand-palette blobs on a clean base for light & dark modes.
 */
export const ShaderHeroCanvas = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    // Spring-lerped mouse (Emil: decorative parallax needs spring, not raw coords)
    const mouse = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2 };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', resize);

    // Blob definitions — each drifts on its own sine path
    const blobs = [
      { cx: 0.25, cy: 0.30, r: 0.45, sx: 0.7, sy: 0.5, dark: 'rgba(59,130,246,0.14)', light: 'rgba(59,130,246,0.10)' },
      { cx: 0.70, cy: 0.55, r: 0.40, sx: 0.9, sy: 0.6, dark: 'rgba(139,92,246,0.12)', light: 'rgba(139,92,246,0.08)' },
      { cx: 0.50, cy: 0.75, r: 0.35, sx: 0.6, sy: 0.8, dark: 'rgba(6,182,212,0.10)',  light: 'rgba(6,182,212,0.06)' },
      { cx: 0.80, cy: 0.25, r: 0.30, sx: 1.1, sy: 0.4, dark: 'rgba(236,72,153,0.08)', light: 'rgba(236,72,153,0.05)' },
    ];

    let t = 0;

    const render = () => {
      t += 0.003;

      // Spring interpolation for mouse
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      const isDark = document.documentElement.classList.contains('dark');

      // Fill base
      ctx.fillStyle = isDark ? '#08080C' : '#F8FAFC';
      ctx.fillRect(0, 0, W, H);

      const mx = (mouse.x / W - 0.5) * 0.08;
      const my = (mouse.y / H - 0.5) * 0.08;

      // Draw each blob as a soft radial gradient
      blobs.forEach((b) => {
        const x = W * b.cx + Math.sin(t * b.sx) * W * 0.08 + mx * W * 0.5;
        const y = H * b.cy + Math.cos(t * b.sy) * H * 0.06 + my * H * 0.5;
        const radius = Math.max(W, H) * b.r;

        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, isDark ? b.dark : b.light);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // Subtle grain overlay for texture (single pass)
      if (isDark) {
        ctx.fillStyle = 'rgba(255,255,255,0.012)';
        for (let i = 0; i < 80; i++) {
          const gx = Math.random() * W;
          const gy = Math.random() * H;
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // Soft vignette at edges
      const vig = ctx.createRadialGradient(W / 2, H * 0.45, W * 0.15, W / 2, H * 0.45, W * 0.9);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, isDark ? 'rgba(8,8,12,0.5)' : 'rgba(248,250,252,0.4)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};
