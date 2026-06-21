"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

function HolographicGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      globeRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group>
      {/* The Core Planet */}
      <Sphere ref={globeRef} args={[2.5, 64, 64]}>
        <meshStandardMaterial 
          color="#00f0ff" 
          wireframe={true} 
          transparent 
          opacity={0.3} 
          emissive="#00f0ff"
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Holographic Data Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[3.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#8a2be2" transparent opacity={0.6} />
      </mesh>
      
      {/* Inner Glow */}
      <Sphere args={[2.4, 32, 32]}>
        <meshBasicMaterial color="#001a33" transparent opacity={0.8} />
      </Sphere>
    </group>
  );
}

export default function ThreeEarth() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
        <HolographicGlobe />
      </Canvas>
    </div>
  );
}
