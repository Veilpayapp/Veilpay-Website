import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Plane } from '@react-three/drei';
import * as THREE from 'three';

const InteractiveFluidWave = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smoothly follow the mouse with organic lag to create interactive ripples
    const targetX = (state.pointer.x * state.viewport.width) / 4;
    const targetY = (state.pointer.y * state.viewport.height) / 4;
    
    // Subtle tilt based on mouse position
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, (targetX * 0.1), 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -0.4 + (targetY * -0.1), 0.05);
    
    // Flowing liquid wave effect
    meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <Plane 
      ref={meshRef}
      visible 
      args={[15, 10, 150, 150]} 
      position={[0, -1, -2]}
      rotation={[-0.4, 0, 0]} // Tilted back to look like a surface
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <MeshDistortMaterial
        color="#F2C572"
        attach="material"
        distort={hovered ? 0.6 : 0.3}
        speed={hovered ? 3.0 : 1.5}
        roughness={0.1}
        metalness={0.9}
        emissive="#F2C572"
        emissiveIntensity={0.2}
      />
    </Plane>
  );
};

const GoldenFluidBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-auto" style={{ transform: 'scale(1.5)' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#F2C572" />
        <InteractiveFluidWave />
      </Canvas>
    </div>
  );
};

export default React.memo(GoldenFluidBackground);
