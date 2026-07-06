import { useRef, useEffect } from 'react';

export const SparklesCore = ({
  id,
  background,
  minSize = 0.4,
  maxSize = 1.5,
  particleDensity = 300,
  className = '',
  particleColor = '#FFFFFF',
}: {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isVisible = useRef(true);

  // satisfy TS unused locals rule while keeping prop signature intact
  void particleColor;
  void minSize;
  void maxSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The footer is position:fixed (always technically "in viewport"), so an
    // IntersectionObserver reports it visible even while it's hidden behind the
    // page. Instead, gate the animation on real scroll proximity to the bottom
    // of the document — this keeps the particle loop completely idle during the
    // initial load (it was costing ~1.8s of main-thread time at startup).
    isVisible.current = false;
    const updateActive = () => {
      const doc = document.documentElement;
      const nearBottom =
        window.scrollY + window.innerHeight > doc.scrollHeight - window.innerHeight * 1.5;
      isVisible.current = nearBottom;
    };
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });

    // Cap DPR — the backing store is 1400², so DPR 3 would allocate a ~4200²
    // canvas and make every clear/redraw enormous. 1.5 is plenty behind a mask.
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const SIZE = 1400;

    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.scale(DPR, DPR);

    const centerX = SIZE / 2;
    const centerY = SIZE / 2;
    const maxRadius = SIZE * 0.42;
    const COUNT = particleDensity || 300;
    const colours = ["#FDF3DC", "#E8B84B", "#E8B84B", "#E8B84B", "#B8791F"];

    const particles = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const baseRadius = Math.sqrt(Math.random()) * maxRadius;
      return {
        angle,
        baseRadius,
        length: 6 + Math.random() * 14,
        width: 1 + Math.random() * 1.5,
        baseOpacity: 0.15 + Math.random() * 0.6,
        colour: colours[Math.floor(Math.random() * colours.length)],
      };
    });

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    window.addEventListener("mousemove", handleMouseMove);

    let rotation = 0;
    let pulseRadius = -80;
    let raf: number;

    function draw() {
      raf = requestAnimationFrame(draw);
      
      // PAUSE drawing if not visible (saves battery/CPU/scroll lag)
      if (!isVisible.current) return;

      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      rotation += 0.0002;
      pulseRadius += 0.6;                       // the travelling ring
      if (pulseRadius > maxRadius + 80) pulseRadius = -80;

      ctx!.clearRect(0, 0, SIZE, SIZE);
      if (background && background !== 'transparent') {
        ctx!.fillStyle = background;
        ctx!.fillRect(0, 0, SIZE, SIZE);
      }
      const parallaxStrength = 22;

      particles.forEach((p) => {
        const angle = p.angle + rotation;
        const depthFactor = p.baseRadius / maxRadius;
        const x = centerX + Math.cos(angle) * p.baseRadius + m.x * parallaxStrength * depthFactor;
        const y = centerY + Math.sin(angle) * p.baseRadius * 0.9 + m.y * parallaxStrength * depthFactor;

        // PULSY WAVE: particles near the travelling ring brighten + stretch
        const dist = Math.abs(p.baseRadius - pulseRadius);
        const waveBoost = Math.max(0, 1 - dist / 60);
        const opacity = Math.min(1, p.baseOpacity + waveBoost * 0.6);
        const length = p.length * (1 + waveBoost * 0.5);

        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(angle + Math.PI / 2);
        ctx!.globalAlpha = opacity;
        ctx!.fillStyle = p.colour;
        ctx!.beginPath();
        ctx!.roundRect(-length / 2, -p.width / 2, length, p.width, p.width / 2);
        ctx!.fill();
        ctx!.restore();
      });
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [background, particleDensity]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.6,
        maskImage: "radial-gradient(circle at center, black 45%, transparent 88%)",
        WebkitMaskImage: "radial-gradient(circle at center, black 45%, transparent 88%)",
      }}
    />
  );
};
