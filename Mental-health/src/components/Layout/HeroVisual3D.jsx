import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'

const AnimatedSphere = () => {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={3}>
      <Sphere args={[1, 128, 128]} scale={2.5}>
        <MeshDistortMaterial
          color="#a855f7"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>
      <Sphere args={[1, 64, 64]} scale={2.4}>
        <MeshDistortMaterial
          color="#ec4899"
          attach="material"
          distort={0.5}
          speed={1.5}
          roughness={0}
          transparent={true}
          opacity={0.8}
        />
      </Sphere>
    </Float>
  )
}

export default function HeroVisual3D() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <AnimatedSphere />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
