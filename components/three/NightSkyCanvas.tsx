"use client";

// 夏祭りの夜空：星 + 舞う金粉 + 打ち上がる花火 を WebGL で描画する背景。
// ポインターに反応してカメラがわずかに視差移動する。ヒーロー背面に絶対配置。
// SSR を避けるため、page 側で dynamic(ssr:false) 読み込みする前提。

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { THEME } from "@/lib/site-data";

type Quality = "high" | "low";

function useSoftTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* --- 星空 --- */
function Starfield({ count, texture }: { count: number; texture: THREE.Texture }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 44;
      pos[i * 3 + 1] = (Math.random() - 0.2) * 26;
      pos[i * 3 + 2] = -6 - Math.random() * 16;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.14,
        map: texture,
        color: new THREE.Color("#dfe7ff"),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [texture]
  );

  useFrame((state) => {
    if (ref.current) {
      const m = ref.current.material as THREE.PointsMaterial;
      m.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 1.5) * 0.25;
    }
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* --- 舞う金粉 --- */
function GoldDust({ count, texture }: { count: number; texture: THREE.Texture }) {
  const ref = useRef<THREE.Points>(null);
  const velocities = useMemo(() => {
    const v = new Float32Array(count);
    for (let i = 0; i < count; i++) v[i] = 0.15 + Math.random() * 0.4;
    return v;
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 2] = -2 - Math.random() * 8;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.22,
        map: texture,
        color: new THREE.Color(THEME.gold),
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [texture]
  );

  useFrame((state, delta) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += velocities[i] * delta;
      arr[i * 3] += Math.sin(t * 0.6 + i) * delta * 0.25;
      if (arr[i * 3 + 1] > 14) {
        arr[i * 3 + 1] = -14;
        arr[i * 3] = (Math.random() - 0.5) * 34;
      }
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* --- 花火 --- */
type Burst = {
  active: boolean;
  t: number;
  life: number;
  origin: THREE.Vector3;
  color: THREE.Color;
  vel: Float32Array;
};

function Fireworks({
  maxBursts,
  particlesPerBurst,
  texture,
}: {
  maxBursts: number;
  particlesPerBurst: number;
  texture: THREE.Texture;
}) {
  const ref = useRef<THREE.Points>(null);
  const total = maxBursts * particlesPerBurst;
  const timerRef = useRef(0);
  const palette = useMemo(() => THEME.fireworks.map((c) => new THREE.Color(c)), []);

  const bursts = useMemo<Burst[]>(() => {
    return Array.from({ length: maxBursts }, () => ({
      active: false,
      t: 0,
      life: 1.6,
      origin: new THREE.Vector3(),
      color: new THREE.Color(),
      vel: new Float32Array(particlesPerBurst * 3),
    }));
  }, [maxBursts, particlesPerBurst]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    return geo;
  }, [total]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.28,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [texture]
  );

  const ignite = (b: Burst) => {
    b.active = true;
    b.t = 0;
    b.life = 1.4 + Math.random() * 0.8;
    b.origin.set((Math.random() - 0.5) * 18, 2 + Math.random() * 6, -4 - Math.random() * 4);
    b.color.copy(palette[Math.floor(Math.random() * palette.length)]);
    const spread = 2.6 + Math.random() * 1.8;
    for (let i = 0; i < particlesPerBurst; i++) {
      // 球状に飛散
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = spread * (0.5 + Math.random() * 0.5);
      b.vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      b.vel[i * 3 + 1] = Math.cos(phi) * speed;
      b.vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
  };

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = ref.current.geometry.attributes.color as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;
    const gravity = -1.4;

    // 打ち上げタイミング
    timerRef.current -= dt;
    if (timerRef.current <= 0) {
      const idle = bursts.find((b) => !b.active);
      if (idle) ignite(idle);
      timerRef.current = 0.55 + Math.random() * 0.7;
    }

    for (let bi = 0; bi < bursts.length; bi++) {
      const b = bursts[bi];
      const base = bi * particlesPerBurst;
      if (!b.active) {
        for (let i = 0; i < particlesPerBurst; i++) {
          const idx = (base + i) * 3;
          col[idx] = col[idx + 1] = col[idx + 2] = 0;
        }
        continue;
      }
      b.t += dt;
      const life = b.t / b.life;
      const fade = Math.max(0, 1 - life);
      const drag = Math.pow(0.92, b.t * 60 * dt * 0.5 + 1);
      for (let i = 0; i < particlesPerBurst; i++) {
        const idx = (base + i) * 3;
        const t = b.t;
        pos[idx] = b.origin.x + b.vel[i * 3] * t * drag;
        pos[idx + 1] = b.origin.y + b.vel[i * 3 + 1] * t * drag + 0.5 * gravity * t * t;
        pos[idx + 2] = b.origin.z + b.vel[i * 3 + 2] * t * drag;
        const twinkle = 0.75 + Math.random() * 0.25;
        const f = fade * twinkle;
        col[idx] = b.color.r * f;
        col[idx + 1] = b.color.g * f;
        col[idx + 2] = b.color.b * f;
      }
      if (b.t >= b.life) b.active = false;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* --- ポインター視差カメラ --- */
function ParallaxRig({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  useFrame((state) => {
    if (!enabled) return;
    const px = state.pointer.x;
    const py = state.pointer.y;
    camera.position.x += (px * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (py * 1.0 - camera.position.y) * 0.04;
    camera.lookAt(0, 1, 0);
  });
  return null;
}

export default function NightSkyCanvas({
  quality = "high",
  interactive = true,
}: {
  quality?: Quality;
  interactive?: boolean;
}) {
  const hi = quality === "high";
  return (
    <Canvas
      camera={{ position: [0, 0.5, 13], fov: 60 }}
      dpr={hi ? [1, 1.8] : [1, 1.2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <SceneContents hi={hi} interactive={interactive} />
    </Canvas>
  );
}

function SceneContents({ hi, interactive }: { hi: boolean; interactive: boolean }) {
  const texture = useSoftTexture();
  return (
    <>
      <Starfield count={hi ? 420 : 180} texture={texture} />
      <GoldDust count={hi ? 220 : 100} texture={texture} />
      <Fireworks maxBursts={hi ? 6 : 3} particlesPerBurst={hi ? 90 : 45} texture={texture} />
      <ParallaxRig enabled={interactive} />
    </>
  );
}
