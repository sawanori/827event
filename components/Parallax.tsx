"use client";

// スクロール連動パララックス（装飾レイヤー用）。要素がビューポートを通過する進捗に
// 応じて Y 移動する。speed が大きいほど動きが強い（正で下→上へ流れる）。
// spring で平滑化し、reduce-motion 時は静止する。

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

export default function Parallax({
  children,
  speed = 0.3,
  className,
  style,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.5, restDelta: 0.001 });
  const range = speed * 160;
  const y = useTransform(smooth, [0, 1], reduce ? [0, 0] : [range, -range]);

  return (
    <motion.div ref={ref} style={{ y, willChange: "transform", ...style }} className={className}>
      {children}
    </motion.div>
  );
}
