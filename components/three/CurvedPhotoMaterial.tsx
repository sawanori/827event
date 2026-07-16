"use client";

// なだらかに湾曲した写真プレーン用のシェーダーマテリアル。
// - 頂点：ごく浅い円筒状の湾曲＋スクロール速度による微小変位
// - 断片：2枚の写真をクロスフェード、ポインタ視差、スクロール速度のRGBずれ、周辺減光
// 色は正しく保つ：sRGBテクスチャを線形で読み、末尾の <colorspace_fragment> で再エンコード。

import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElement } from "@react-three/fiber";

export const CurvedPhotoMaterial = shaderMaterial(
  {
    uTexA: null as THREE.Texture | null,
    uTexB: null as THREE.Texture | null,
    uMix: 0,
    uTime: 0,
    uScrollVel: 0,
    uPointer: new THREE.Vector2(0, 0),
    uHover: 0,
    uOpacity: 1,
    uAspect: 0.75, // 画像アスペクト（w/h）— cover フィット用
    uPlaneAspect: 0.75,
  },
  /* glsl vertex */ `
    uniform float uTime;
    uniform float uScrollVel;
    uniform float uHover;

    varying vec2 vUv;
    varying float vBend;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // 浅い円筒湾曲：端に向かって z を奥へ。中央=1、端で緩やかに凹む。
      float curve = 0.055;
      float bend = (cos(pos.x * 3.14159265 * 0.5) - 1.0) * curve;
      pos.z += bend;
      pos.z += (cos(pos.y * 3.14159265 * 0.5) - 1.0) * (curve * 0.3);

      // スクロール中だけ、ほんの少し面が波打つ（速度が0に戻ると収束）。
      float ripple = sin(pos.y * 5.0 + uTime * 2.0) * 0.5 + 0.5;
      pos.z += uScrollVel * 0.03 * ripple;
      pos.z += uHover * 0.02;

      vBend = bend;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* glsl fragment */ `
    uniform sampler2D uTexA;
    uniform sampler2D uTexB;
    uniform float uMix;
    uniform float uScrollVel;
    uniform vec2  uPointer;
    uniform float uHover;
    uniform float uOpacity;
    uniform float uAspect;
    uniform float uPlaneAspect;

    varying vec2 vUv;
    varying float vBend;

    // cover フィット：プレーンのアスペクトに合わせて画像を切り抜く
    vec2 coverUv(vec2 uv, float imgAspect, float planeAspect) {
      vec2 s = vec2(1.0);
      if (imgAspect > planeAspect) {
        s.x = planeAspect / imgAspect;
      } else {
        s.y = imgAspect / planeAspect;
      }
      return (uv - 0.5) * s + 0.5;
    }

    void main() {
      // ポインタによる微視差
      vec2 parallax = uPointer * 0.010 * (0.5 + 0.5 * uHover);
      vec2 baseUv = coverUv(vUv, uAspect, uPlaneAspect) + parallax;

      // スクロール速度に応じたRGBずれ（最大約0.5%）
      float amt = clamp(abs(uScrollVel), 0.0, 1.0) * 0.005;
      vec2 dir = vec2(1.0, 0.0);

      vec4 a = vec4(
        texture2D(uTexA, baseUv + dir * amt).r,
        texture2D(uTexA, baseUv).g,
        texture2D(uTexA, baseUv - dir * amt).b,
        1.0
      );
      vec4 b = vec4(
        texture2D(uTexB, baseUv + dir * amt).r,
        texture2D(uTexB, baseUv).g,
        texture2D(uTexB, baseUv - dir * amt).b,
        1.0
      );

      vec4 color = mix(a, b, clamp(uMix, 0.0, 1.0));

      // 周辺減光
      vec2 c = vUv - 0.5;
      float vig = smoothstep(0.9, 0.28, dot(c, c) * 2.0);
      color.rgb *= mix(0.9, 1.0, vig);

      // 湾曲によるごく僅かな陰影
      color.rgb *= 1.0 + vBend * 0.5;

      color.a = uOpacity;

      gl_FragColor = color;

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ CurvedPhotoMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    curvedPhotoMaterial: ThreeElement<typeof CurvedPhotoMaterial>;
  }
}
