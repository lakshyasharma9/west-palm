"use client";

import { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { Group } from "three";

function Model({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF("/models/agile_embassy_garden/scene.gltf");

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef} scale={isMobile ? 0.020 : 0.023} position={[0, isMobile ? -1.8 : -2.5, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#146321" wireframe />
    </mesh>
  );
}

export default function RealBuildingModel() {
  const [showGlow, setShowGlow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lazy preload - only after 1 second to prioritize critical content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      useGLTF.preload("/models/agile_embassy_garden/scene.gltf");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const heroSection = document.querySelector('section');
      if (!heroSection) return;
      
      const bounds = heroSection.getBoundingClientRect();
      const relativeX = (e.clientX - bounds.left) / bounds.width;
      
      if (relativeX > 0.5 && e.clientY > bounds.top && e.clientY < bounds.bottom) {
        setShowGlow(true);
      } else {
        setShowGlow(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isVisible) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#146321] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#D4AF37] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(20,99,33,0.9) 0%, rgba(20,99,33,0.8) 20%, rgba(20,99,33,0.5) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          opacity: showGlow ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      
      <Canvas
        camera={{ position: isMobile ? [3.5, 1.5, 3.5] : [4, 1.5, 4], fov: isMobile ? 65 : 65 }}
        style={{ width: '100%', height: '100%', background: "transparent", position: 'relative', zIndex: 2 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.6} />
        <pointLight position={[0, 8, 0]} intensity={0.8} color="#D4AF37" />
        
        <Suspense fallback={<LoadingFallback />}>
          <Model isMobile={isMobile} />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
