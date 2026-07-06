import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import Coin3D from './Coin3D';

interface CoinsSceneProps {
  className?: string;
}

const CoinsScene: React.FC<CoinsSceneProps> = ({ className = '' }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Only render the WebGL scene while the hero is on screen. The coins live in a
  // pinned hero that GSAP translates away on scroll, so pausing the render loop
  // when it leaves the viewport frees the main thread for the rest of the page.
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setActive(entries.some((e) => e.isIntersecting)),
      { rootMargin: '0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={`absolute inset-0 z-10 pointer-events-none ${className}`}>
      <Canvas
        dpr={1}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        {/* Adjusted studio lighting for charcoal background and amber arc */}
        <directionalLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={1.5} color="#e2e8f0" />
        <ambientLight intensity={0.8} />
        
        <React.Suspense fallback={null}>
          {/* High-contrast Studio Environment for realistic silver reflections */}
          <Environment resolution={32}>
            <group rotation={[-Math.PI / 4, 0, 0]}>
              <mesh position={[0, 10, -5]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[-5, -10, 10]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[30, 30]} />
                <meshBasicMaterial color="#cbd5e1" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[20, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[40, 100]} />
                <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0, -20]}>
                <ringGeometry args={[10, 15, 64]} />
                <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
              </mesh>
            </group>
          </Environment>

          <group position={[0, 1.3, 0]} scale={1.05}> {/* Shifted slightly down and scaled up 5% */}
            {/* Left Coin */}
            <Coin3D position={[-6.2, 1, 0]} rotation={[0.5, 0.4, 0]} />
            {/* Right Coin */}
            <Coin3D position={[6.2, 1.5, 0]} rotation={[-0.2, -0.5, 0.2]} />
            {/* Top Right Coin */}
            <Coin3D position={[4.2, 4, -2]} rotation={[0.8, -0.2, 0.5]} scale={0.7} />
            {/* Bottom Left Coin */}
            <Coin3D position={[-5.2, -4, -1]} rotation={[-0.4, 0.6, -0.3]} scale={0.8} />
            {/* Top Left Coin */}
            <Coin3D position={[-4.5, 3.5, -2]} rotation={[-0.5, 0.2, 0.6]} scale={0.65} />
            {/* Bottom Right Coin */}
            <Coin3D position={[5.5, -3.5, -1.5]} rotation={[0.3, -0.4, -0.5]} scale={0.75} />
          </group>
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default React.memo(CoinsScene);
