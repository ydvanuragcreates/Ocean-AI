import { useRef, useLayoutEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface DocumentStackProps {
  docType: string;
  itemCount: number;
}

// ----------------------------------------------------------
// 1. Animated Sheet Component
// Handles the physics/animation for each individual page
// ----------------------------------------------------------
function AnimatedSheet({ 
  position, 
  color, 
  isSlide 
}: { 
  position: [number, number, number], 
  color: string, 
  isSlide: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Target: Where the paper belongs in the stack
  const targetPos = new THREE.Vector3(...position);
  
  // Start: High up (+5 Y) and slightly back (+2 Z) so it flies in
  const startPos = new THREE.Vector3(position[0], position[1] + 5, position[2] + 2);

  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    if (meshRef.current && !isMounted) {
      // Instantly snap to the sky when created
      meshRef.current.position.copy(startPos);
      setIsMounted(true);
    }
  }, [startPos, isMounted]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Lerp (Linear Interpolation) for smooth movement
      // The '8' is the speed factor. Higher = Faster.
      meshRef.current.position.lerp(targetPos, delta * 8);
    }
  });

  // Choose geometry based on doc type
  const geometry = isSlide 
    ? <boxGeometry args={[0.32, 0.18, 0.005]} /> // Wide (PPT)
    : <boxGeometry args={[0.21, 0.297, 0.005]} />; // Tall (Word)

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.3}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// ----------------------------------------------------------
// 2. Stack Controller
// ----------------------------------------------------------
function Stack({ docType, itemCount }: DocumentStackProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Float the whole stack gently
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime / 2) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime / 4) * 0.1;
    }
  });

  const count = Math.max(1, itemCount);

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const offset = i * 0.012; // Spacing between papers
        // Top page is white, pages below are darker slate-gray
        const color = i === count - 1 ? '#ffffff' : '#94a3b8'; 
        const pos: [number, number, number] = [offset * 0.2, offset, -offset];

        return (
          <AnimatedSheet 
            key={i} 
            position={pos} 
            color={color} 
            isSlide={docType === 'pptx'} 
          />
        );
      })}
    </group>
  );
}

// ----------------------------------------------------------
// 3. Main Scene
// ----------------------------------------------------------
export default function DocumentStack3D({ docType, itemCount }: DocumentStackProps) {
  return (
    <div className="w-full h-full min-h-[400px] relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl">
      <Canvas 
        camera={{ position: [0, 0.3, 2.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Enhanced Lights for maximum visibility */}
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, 5, -10]} intensity={0.8} color="#4a90e2" />
        <spotLight position={[0, 10, 0]} angle={0.5} intensity={1.0} />
        
        <Center>
          <Float speed={2} rotationIntensity={0.25} floatIntensity={0.25}>
             <Stack docType={docType} itemCount={itemCount} />
          </Float>
        </Center>
        
        <Environment preset="sunset" />
      </Canvas>
      
      {/* Visual indicator */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <div className="inline-block px-3 py-1 bg-slate-950/50 backdrop-blur-sm rounded-full text-xs text-slate-400 border border-slate-700/50">
          ✨ 3D Live Preview
        </div>
      </div>
    </div>
  );
}