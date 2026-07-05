import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Decal } from '@react-three/drei';
import * as THREE from 'three';
import { getNextCryptoLogo } from './CryptoLogos';

interface Coin3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  wobbleSpeed?: number;
  rotationSpeed?: number;
}

const Coin3D: React.FC<Coin3DProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  wobbleSpeed = 0.5,
  rotationSpeed = 0.005,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const logoDataUri = useMemo(() => getNextCryptoLogo(), []);
  
  const texture = useTexture(logoDataUri, (loaded) => {
    const applyColorSpace = (t: THREE.Texture) => {
      t.colorSpace = THREE.SRGBColorSpace;
    };
    Array.isArray(loaded) ? loaded.forEach(applyColorSpace) : applyColorSpace(loaded);
  });
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += rotationSpeed; 
    meshRef.current.rotation.x += Math.sin(state.clock.elapsedTime * wobbleSpeed) * 0.002;
    meshRef.current.rotation.z += Math.cos(state.clock.elapsedTime * wobbleSpeed) * 0.002;
  });

  // Ultra-shiny silver material
  const coinMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f1f5f9', // bright silver base
    metalness: 1.0,   // fully metallic
    roughness: 0.1,  // very smooth and shiny
  }), []);

  const decalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.5,
    roughness: 0.3,
    map: texture,
    transparent: true,
    alphaTest: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  }), [texture]);

  // Profile of a real coin with a raised rim, reversed to ensure normals point outward correctly
  const coinProfile = useMemo(() => {
    return [
      new THREE.Vector2(0, 0.06),
      new THREE.Vector2(0.85, 0.06), // inner flat center
      new THREE.Vector2(0.88, 0.09), // bevel up to rim
      new THREE.Vector2(0.96, 0.09), // top flat of rim
      new THREE.Vector2(1.0, 0.05),  // outer top rounded edge
      new THREE.Vector2(1.0, -0.05), // outer bottom rounded edge
      new THREE.Vector2(0.96, -0.09),// bottom flat of rim
      new THREE.Vector2(0.88, -0.09),// bevel down
      new THREE.Vector2(0.85, -0.06),// inner flat bottom
      new THREE.Vector2(0, -0.06),
    ].reverse(); // Reverse to fix winding order/normals
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      material={coinMaterial}
    >
      {/* 3D Coin geometry with raised rim */}
      <latheGeometry args={[coinProfile, 128]} />
      
      {/* Front Face Logo */}
      <Decal
        position={[0, 0.061, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.3, 1.3, 1.3]}
        map={texture}
        material={decalMaterial}
      />
      {/* Back Face Logo */}
      <Decal
        position={[0, -0.061, 0]}
        rotation={[Math.PI / 2, 0, Math.PI]}
        scale={[1.3, 1.3, 1.3]}
        map={texture}
        material={decalMaterial}
      />
    </mesh>
  );
};

export default React.memo(Coin3D);
