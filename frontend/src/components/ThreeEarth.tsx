"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

function HolographicGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.08;
      globeRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.04;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.08) * 0.08;
    }
  });

  return (
    <group>
      {/* The Core Planet */}
      <Sphere ref={globeRef} args={[2.5, 48, 48]}>
        <meshStandardMaterial 
          color="#d97706" 
          wireframe={true} 
          transparent 
          opacity={0.25} 
          emissive="#b45309"
          emissiveIntensity={0.3}
        />
      </Sphere>
      
      {/* Institutional Data Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[3.2, 0.015, 16, 80]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} />
      </mesh>
      
      {/* Inner Subtle Core */}
      <Sphere args={[2.4, 24, 24]}>
        <meshBasicMaterial color="#0b0d11" transparent opacity={0.85} />
      </Sphere>
    </group>
  );
}

export default function ThreeEarth() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#f59e0b" />
        <Stars radius={100} depth={50} count={2000} factor={3} saturation={0.5} fade speed={0.8} />
        <HolographicGlobe />
      </Canvas>
    </div>
  );
}

