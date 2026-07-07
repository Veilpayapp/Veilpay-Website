import { useEffect, useRef } from 'react';
import { TOUCH } from '@/lib/scrollConfig';

interface GoldenWavesProps {
  /** Slim mode draws a few thin flowing golden lines (for a compact band)
   *  instead of full-height filled bands. */
  slim?: boolean;
}

/**
 * GoldenWaves — a lightweight, interactive flowing-waves canvas.
 *
 * Replaces the previous @firecms/neat WebGL gradient (which compiled a shader
 * and ran a permanent GPU render loop). Plain 2D canvas, so it:
 *   - has no WebGL context / shader-compile cost,
 *   - only animates while visible (IntersectionObserver),
 *   - pauses when the tab is hidden,
 *   - renders a single static frame under prefers-reduced-motion,
 *   - reacts to the pointer for a subtle parallax.
 *
 * On mobile (TOUCH), renders a pre-baked static SVG instead of running
 * a canvas animation loop — zero JS cost, zero rAF, zero GPU compositing.
 */
export default function GoldenWaves({ slim = false }: GoldenWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // If on mobile, do not run the canvas logic
    if (TOUCH) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Slim: thin luminous lines centred in the band. Full: stacked filled bands.
    const lines = slim
      ? [
          { color: 'rgba(249, 212, 131, 0.9)', amp: 0.26, speed: 0.0016, freq: 1.4, y: 0.5, phase: 0, w: 2 },
          { color: 'rgba(212, 160, 66, 0.8)', amp: 0.20, speed: 0.0021, freq: 1.9, y: 0.5, phase: 2.2, w: 1.6 },
          { color: 'rgba(170, 99, 6, 0.7)', amp: 0.16, speed: 0.0026, freq: 2.5, y: 0.5, phase: 4.1, w: 1.2 },
        ]
      : [
          { color: 'rgba(255, 204, 0, 0.45)', amp: 0.095, speed: 0.00022, freq: 1.1, y: 0.74, phase: 0, w: 0 },
          { color: 'rgba(255, 153, 0, 0.55)', amp: 0.085, speed: 0.00030, freq: 1.5, y: 0.62, phase: 2.1, w: 0 },
          { color: 'rgba(255, 102, 0, 0.65)', amp: 0.075, speed: 0.00041, freq: 1.9, y: 0.52, phase: 4.2, w: 0 },
          { color: 'rgba(255, 204, 80, 0.4)', amp: 0.065, speed: 0.00052, freq: 2.4, y: 0.42, phase: 5.7, w: 0 },
        ];

    let pointerX = 0;
    let targetX = 0;
    const onPointer = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      pointerX += (targetX - pointerX) * 0.05;
      const step = Math.max(6, width / 64);

      for (const b of lines) {
        const baseY = height * b.y;
        const amp = height * b.amp;

        if (slim) {
          // Thin flowing line with a soft golden glow.
          ctx.beginPath();
          for (let x = 0; x <= width; x += step) {
            const nx = x / width;
            const y = baseY + Math.sin(nx * Math.PI * 2 * b.freq + t * b.speed + b.phase + pointerX * 0.6) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.w;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // Filled band fading to transparent at the bottom.
          const grad = ctx.createLinearGradient(0, baseY - amp, 0, height);
          grad.addColorStop(0, b.color);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += step) {
            const nx = x / width;
            const y = baseY + Math.sin(nx * Math.PI * 2 * b.freq + t * b.speed + b.phase + pointerX * 0.6) * amp;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    let raf = 0;
    let running = false;
    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
        else stop();
      },
      { rootMargin: '100px' },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });

    draw(0);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [slim]);

  if (TOUCH) {
    return (
      <img
        src="/golden-waves-static.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
      />
    );
  }

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

