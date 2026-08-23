import React, { useEffect, useRef } from 'react';

export const ShaderHeroCanvas = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: ['#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'][Math.floor(Math.random() * 4)],
    }));

    let time = 0;

    const render = () => {
      time += 0.008;

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#08080C' : '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Aurora Blob 1
      const x1 = width * 0.3 + Math.sin(time * 0.8) * 120 + (mouse.x - width / 2) * 0.15;
      const y1 = height * 0.4 + Math.cos(time * 0.6) * 80 + (mouse.y - height / 2) * 0.15;
      const g1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, width * 0.45);
      g1.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.15)');
      g1.addColorStop(0.5, isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)');
      g1.addColorStop(1, isDark ? 'rgba(8, 8, 12, 0)' : 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Aurora Blob 2
      const x2 = width * 0.7 + Math.cos(time * 0.9) * 140 - (mouse.x - width / 2) * 0.1;
      const y2 = height * 0.5 + Math.sin(time * 0.7) * 90 - (mouse.y - height / 2) * 0.1;
      const g2 = ctx.createRadialGradient(x2, y2, 20, x2, y2, width * 0.4);
      g2.addColorStop(0, isDark ? 'rgba(236, 72, 153, 0.18)' : 'rgba(236, 72, 153, 0.12)');
      g2.addColorStop(0.6, isDark ? 'rgba(6, 182, 212, 0.10)' : 'rgba(6, 182, 212, 0.06)');
      g2.addColorStop(1, isDark ? 'rgba(8, 8, 12, 0)' : 'rgba(248, 250, 252, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // Render drifting particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + p.x));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
