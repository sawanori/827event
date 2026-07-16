"use client";

// スクロール連動パララックス。要素がビューポートを通過する進捗に応じて Y 移動する。
// speed が大きいほど動きが強い（正で下→上へ流れる）。

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const reduced = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], [speed * 120, -speed * 120]);

  return (
    <motion.div ref={ref} style={{ y: reduced ? 0 : y, ...style }} className={className}>
      {children}
    </motion.div>
  );
}
