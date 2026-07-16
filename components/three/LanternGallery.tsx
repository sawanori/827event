"use client";

// 提灯（ちょうちん）状に写真を円環配置した 3D ギャラリー。
// ドラッグ / スワイプで回転、アイドル時はゆっくり自動回転、カードのクリックで
// ライトボックス（onSelect）を開く。SSR 回避のため dynamic(ssr:false) 読み込み前提。

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import { THEME } from "@/lib/site-data";

type DragState = { down: boolean; lastX: number; vel: number; moved: number };

function useSoftTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.4, "rgba(255,190,120,0.5)");
    g.addColorStop(1, "rgba(255,140,60,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function LanternCard({
  url,
  position,
  rotationY,
  glowTex,
  onSelect,
  drag,
}: {
  url: string;
  position: [number, number, number];
  rotationY: number;
  glowTex: THREE.Texture;
  onSelect: (url: string) => void;
  drag: React.RefObject<DragState>;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    const target = hovered ? 1.08 : 1;
    ref.current.scale.x += (target - ref.current.scale.x) * 0.12;
    ref.current.scale.y += (target - ref.current.scale.y) * 0.12;
    ref.current.scale.z += (target - ref.current.scale.z) * 0.12;
  });

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
      {/* 提灯の灯り（グロー） */}
      <sprite position={[0, 0, -0.15]} scale={[4.6, 5.6, 1]}>
        <spriteMaterial
          map={glowTex}
          color={new THREE.Color(THEME.lantern)}
          transparent
          opacity={hovered ? 0.85 : 0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* 金の縁 */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.62, 3.42]} />
        <meshBasicMaterial color={new THREE.Color(THEME.gold)} toneMapped={false} />
      </mesh>

      {/* 写真 */}
      <DreiImage
        url={url}
        scale={[2.4, 3.2]}
        radius={0.08}
        transparent
        toneMapped={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          // ドラッグ操作ではライトボックスを開かない
          if ((drag.current?.moved ?? 0) < 6) onSelect(url);
        }}
      />

      {/* 吊り紐と上下の口金 */}
      <mesh position={[0, 2.0, -0.05]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 6]} />
        <meshBasicMaterial color="#1a1206" />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <boxGeometry args={[0.7, 0.14, 0.12]} />
        <meshBasicMaterial color="#241708" />
      </mesh>
      <mesh position={[0, -1.66, 0]}>
        <boxGeometry args={[0.7, 0.14, 0.12]} />
        <meshBasicMaterial color="#241708" />
      </mesh>
    </group>
  );
}

function Ring({
  images,
  onSelect,
  drag,
  autoRotate,
}: {
  images: string[];
  onSelect: (url: string) => void;
  drag: React.RefObject<DragState>;
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowTex = useSoftTexture();
  const N = images.length;
  const radius = Math.max(4.6, N * 0.62);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const d = drag.current;
    if (d) {
      g.rotation.y += d.vel;
      d.vel *= d.down ? 0.8 : 0.95;
      if (!d.down && autoRotate) g.rotation.y += 0.08 * delta;
    } else if (autoRotate) {
      g.rotation.y += 0.08 * delta;
    }
    // ごく僅かな上下の揺れ
    g.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {images.map((url, i) => {
        const angle = (i / N) * Math.PI * 2;
        return (
          <LanternCard
            key={`${url}-${i}`}
            url={url}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotationY={angle}
            glowTex={glowTex}
            onSelect={onSelect}
            drag={drag}
          />
        );
      })}
    </group>
  );
}

export default function LanternGallery({
  images,
  onSelect,
  autoRotate = true,
}: {
  images: string[];
  onSelect: (url: string) => void;
  autoRotate?: boolean;
}) {
  const drag = useRef<DragState>({ down: false, lastX: 0, vel: 0, moved: 0 });
  const N = images.length;
  const radius = Math.max(4.6, N * 0.62);

  const onDown = (clientX: number) => {
    drag.current.down = true;
    drag.current.lastX = clientX;
    drag.current.moved = 0;
  };
  const onMove = (clientX: number) => {
    if (!drag.current.down) return;
    const dx = clientX - drag.current.lastX;
    drag.current.lastX = clientX;
    drag.current.moved += Math.abs(dx);
    drag.current.vel += dx * 0.0008;
  };
  const onUp = () => {
    drag.current.down = false;
    // クリック判定を次フレームまで保持したいので moved はリセットしない
  };

  return (
    <div
      style={{ width: "100%", height: "100%", touchAction: "pan-y", cursor: "grab" }}
      onPointerDown={(e) => onDown(e.clientX)}
      onPointerMove={(e) => onMove(e.clientX)}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
    >
      <Canvas
        camera={{ position: [0, 0, radius + 6.5], fov: 42 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <Suspense fallback={null}>
          <Ring images={images} onSelect={onSelect} drag={drag} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
