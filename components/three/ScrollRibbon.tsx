"use client";

// スクロール連動のWebGLリボン（box1.co.jp のスクロール演出をトンマナに合わせて翻案）。
// 縦スクロールに応じて、なだらかな弧状に並んだポートレートが横へ流れる。各面は
// 弧に沿って傾き、スクロール速度でRGBが僅かにずれる。背後に巨大な淡い透かし語。
// ピン留め（sticky）区間でスクラブする。SSR回避のため dynamic(ssr:false) 前提。

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Preload } from "@react-three/drei";
import * as THREE from "three";
import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { CurvedPhotoMaterial } from "./CurvedPhotoMaterial";

function Reel({
  images,
  progress,
  vel,
}: {
  images: string[];
  progress: MotionValue<number>;
  vel: MotionValue<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const textures = useTexture(images) as THREE.Texture[];
  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    });
  }, [textures]);

  const { viewport } = useThree();
  const planeW = 2.4;
  const planeH = 3.2;
  const spacing = planeW * 1.24;
  const N = images.length;
  const W = (N - 1) * spacing;
  const smoothVel = useRef(0);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = THREE.MathUtils.clamp(progress.get(), 0, 1);
    const rawV = vel.get();
    smoothVel.current = THREE.MathUtils.lerp(
      smoothVel.current,
      THREE.MathUtils.clamp(rawV * 0.7, -1.4, 1.4),
      0.08
    );
    const velN = smoothVel.current;

    const view = viewport.width;
    const G0 = view * 0.5 + planeW * 0.75;
    const G1 = -W - view * 0.5 - planeW * 0.75;
    const G = G0 + (G1 - G0) * p;

    g.children.forEach((child, i) => {
      const X = i * spacing + G;
      child.position.x = X;
      child.position.z = -0.02 * X * X; // 弧（中央が手前、端が奥）
      child.rotation.y = -0.045 * X; // 弧の接線方向へ傾ける
      child.position.y = Math.sin(state.clock.elapsedTime * 0.3 + i * 0.9) * 0.05;
      const m = (child as THREE.Mesh).material as unknown as {
        uniforms?: Record<string, { value: number }>;
      };
      if (m?.uniforms) {
        m.uniforms.uScrollVel.value = velN;
        m.uniforms.uTime.value = state.clock.elapsedTime;
        const img = textures[i]?.image as { width?: number; height?: number } | undefined;
        if (img?.width && img?.height) m.uniforms.uAspect.value = img.width / img.height;
      }
    });
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, velN * 0.02, 0.1);
  });

  return (
    <group ref={groupRef}>
      {images.map((url, i) => (
        <mesh key={`${url}-${i}`}>
          <planeGeometry args={[planeW, planeH, 24, 16]} />
          <curvedPhotoMaterial
            key={CurvedPhotoMaterial.key}
            transparent
            toneMapped={false}
            uPlaneAspect={planeW / planeH}
            uTexA={textures[i]}
            uTexB={textures[i]}
          />
        </mesh>
      ))}
    </group>
  );
}

function ReelCanvas({
  images,
  progress,
  vel,
}: {
  images: string[];
  progress: MotionValue<number>;
  vel: MotionValue<number>;
}) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7], fov: 38 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <Reel images={images} progress={progress} vel={vel} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}

export default function ScrollRibbon({
  images,
  label = "Portraits",
  sub = "この夏の一枚",
  watermark = "Gallery",
}: {
  images: string[];
  label?: string;
  sub?: string;
  watermark?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const velRaw = useVelocity(scrollYProgress);
  const vel = useSpring(velRaw, { stiffness: 300, damping: 90 });
  const wmX = useTransform(scrollYProgress, [0, 1], ["6%", "-18%"]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative" style={{ height: "230vh" }} aria-label="作品のスクロール演出">
      <div className="sticky top-0 h-screen overflow-hidden canvas-well">
        {/* 背景の巨大な透かし語 */}
        <motion.span
          aria-hidden
          style={{ x: wmX }}
          className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap font-serif italic"
        >
          <span
            style={{
              fontSize: "clamp(9rem, 26vw, 30rem)",
              color: "var(--ink)",
              opacity: 0.05,
              lineHeight: 1,
              paddingLeft: "4vw",
            }}
          >
            {watermark}
          </span>
        </motion.span>

        {/* WebGL リボン */}
        <ReelCanvas images={images} progress={scrollYProgress} vel={vel} />

        {/* ラベル */}
        <motion.div
          style={{ opacity: labelOpacity }}
          className="pointer-events-none absolute left-6 md:left-14 top-[18vh] z-10"
        >
          <span className="eyebrow">{label}</span>
          <p className="mt-4 font-display text-3xl md:text-5xl" style={{ color: "var(--ink)" }}>
            {sub}
          </p>
        </motion.div>

        {/* スクロールヒント */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-serif text-[0.62rem] tracking-[0.3em]" style={{ color: "var(--subtle)" }}>
            SCROLL
          </span>
        </div>
      </div>
    </section>
  );
}
