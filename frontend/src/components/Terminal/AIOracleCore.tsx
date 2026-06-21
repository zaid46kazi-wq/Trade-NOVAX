"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function NeuralCore({ isAnalyzing }: { isAnalyzing: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      coreRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      // Pulse scale when analyzing
      if (isAnalyzing) {
        const scale = 1 + Math.sin(clock.getElapsedTime() * 10) * 0.1;
        coreRef.current.scale.set(scale, scale, scale);
      } else {
        coreRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <Sphere ref={coreRef} args={[1, 64, 64]} scale={1}>
      <MeshDistortMaterial
        color={isAnalyzing ? "#00f0ff" : "#8a2be2"}
        emissive={isAnalyzing ? "#00f0ff" : "#4b0082"}
        emissiveIntensity={isAnalyzing ? 1.5 : 0.8}
        wireframe={true}
        distort={isAnalyzing ? 0.6 : 0.2}
        speed={isAnalyzing ? 5 : 1}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

export default function AIOracleCore({ isAnalyzing = false }: { isAnalyzing?: boolean }) {
  return (
    <div className="w-full h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00f0ff" />
        <NeuralCore isAnalyzing={isAnalyzing} />
      </Canvas>
    </div>
  );
}
