"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere({ confidence }: { confidence: number }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  // Calculate color and distortion based on confidence
  const isHigh = confidence >= 70;
  const isMed = confidence >= 40 && confidence < 70;
  
  const color = isHigh ? "#00ff00" : isMed ? "#ffd700" : "#ff0000";
  const distort = isHigh ? 0.2 : isMed ? 0.4 : 0.8;
  const scale = 1 + (confidence / 100) * 0.5;

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.5;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={scale}>
      <MeshDistortMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        distort={distort}
        speed={isHigh ? 2 : 6}
        wireframe={true}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

export default function ConfidenceSphere({ confidence = 89 }: { confidence?: number }) {
  return (
    <div className="w-full h-full min-h-[200px] relative flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <AnimatedSphere confidence={confidence} />
        </Canvas>
      </div>
      <div className="z-10 pointer-events-none mt-4 backdrop-blur-md bg-black/40 px-4 py-2 rounded-full border border-white/10">
        <span className="text-white font-mono text-xl font-bold">{confidence}%</span>
      </div>
    </div>
  );
}
