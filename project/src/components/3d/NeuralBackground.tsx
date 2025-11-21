import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function ParticleGroup({ color, count, radius, speed }: { color: string, count: number, radius: number, speed: number }) {
  const ref = useRef<any>();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, radius]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / (10 * speed);
      ref.current.rotation.y -= delta / (15 * speed);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={0.003}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export default function NeuralBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-slate-950">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleGroup color="#a855f7" count={2000} radius={1.5} speed={1} />
        <ParticleGroup color="#06b6d4" count={1500} radius={1.2} speed={1.5} />
      </Canvas>
    </div>
  );
}