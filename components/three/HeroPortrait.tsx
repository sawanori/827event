"use client";

// ヒーローのWebGL中心：なだらかに湾曲した縦位置ポートレートが、
// スタジオの作品をゆっくりクロスフェードで巡る。ポインタへ傾いて奥行きを生み、
// スクロール速度に応じて僅かにRGBがずれる。SSR回避のため dynamic(ssr:false) 前提。

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Preload } from "@react-three/drei";
import * as THREE from "three";
import { CurvedPhotoMaterial } from "./CurvedPhotoMaterial";

function Portrait({ images }: { images: string[] }) {
  const matRef = useRef<InstanceType<typeof CurvedPhotoMaterial> | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const textures = useTexture(images) as THREE.Texture[];

  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    });
  }, [textures]);

  const idx = useRef({ a: 0, b: images.length > 1 ? 1 : 0 });
  const hold = useRef(0);
  const fading = useRef(false);
  const scrollVel = useRef(0);
  const lastScroll = useRef(0);
  const enter = useRef(0);
  const hover = useRef(0);

  const setAspectFrom = (t: THREE.Texture) => {
    const img = t.image as { width?: number; height?: number } | undefined;
    if (matRef.current && img?.width && img?.height) {
      matRef.current.uniforms.uAspect.value = img.width / img.height;
    }
  };

  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTexA.value = textures[idx.current.a];
    m.uniforms.uTexB.value = textures[idx.current.b];
    m.uniforms.uMix.value = 0;
    setAspectFrom(textures[idx.current.a]);
    if (typeof window !== "undefined") lastScroll.current = window.scrollY;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);

  useFrame((state, delta) => {
    const m = matRef.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    m.uniforms.uTime.value = state.clock.elapsedTime;

    // 登場フェードイン
    enter.current = THREE.MathUtils.lerp(enter.current, 1, 0.045);
    m.uniforms.uOpacity.value = enter.current;

    // スクロール速度（window の移動量から）
    const sy = window.scrollY;
    const dv = sy - lastScroll.current;
    lastScroll.current = sy;
    scrollVel.current = THREE.MathUtils.clamp(scrollVel.current + dv * 0.012, -1, 1);
    scrollVel.current = THREE.MathUtils.lerp(scrollVel.current, 0, 1 - Math.pow(0.0015, dt));
    if (Math.abs(scrollVel.current) < 0.0006) scrollVel.current = 0;
    m.uniforms.uScrollVel.value = scrollVel.current;

    // ポインタ視差＋グループの傾き
    const p = m.uniforms.uPointer.value as THREE.Vector2;
    p.x = THREE.MathUtils.lerp(p.x, pointer.x, 0.06);
    p.y = THREE.MathUtils.lerp(p.y, pointer.y, 0.06);
    m.uniforms.uHover.value = THREE.MathUtils.lerp(m.uniforms.uHover.value, hover.current, 0.1);

    const g = groupRef.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.11, 0.05);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.07, 0.05);
      g.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }

    // クロスフェード
    if (images.length > 1) {
      if (!fading.current) {
        hold.current += dt;
        if (hold.current > 5.2) fading.current = true;
      } else {
        m.uniforms.uMix.value = Math.min(1, m.uniforms.uMix.value + dt / 0.85);
        if (m.uniforms.uMix.value >= 1) {
          idx.current.a = idx.current.b;
          idx.current.b = (idx.current.b + 1) % images.length;
          m.uniforms.uTexA.value = textures[idx.current.a];
          m.uniforms.uTexB.value = textures[idx.current.b];
          setAspectFrom(textures[idx.current.a]);
          m.uniforms.uMix.value = 0;
          fading.current = false;
          hold.current = 0;
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh onPointerOver={() => (hover.current = 1)} onPointerOut={() => (hover.current = 0)}>
        <planeGeometry args={[3, 4, 40, 24]} />
        <curvedPhotoMaterial
          ref={matRef}
          key={CurvedPhotoMaterial.key}
          transparent
          toneMapped={false}
          uPlaneAspect={0.75}
          uTexA={textures[idx.current.a]}
          uTexB={textures[idx.current.b]}
        />
      </mesh>
    </group>
  );
}

export default function HeroPortrait({ images }: { images: string[] }) {
  const imgs = images.length ? images : [];
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4.9], fov: 42 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <Portrait images={imgs} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
