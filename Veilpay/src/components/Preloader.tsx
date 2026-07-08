import { useEffect, useRef } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => {
      onComplete();
    }, 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="v-loader">
        <div className="node" />
        <div className="node" />
        <div className="node" />
        <div className="node" />
        <div className="node" />
      </div>
    </div>
  );
}
