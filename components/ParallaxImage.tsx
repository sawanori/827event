"use client";

// フレーム内で写真をゆっくり視差移動させる表示専用コンポーネント。
// 画像はフレームより一回り大きく、スクロールに対してフレームより遅く動くため
// 奥行きが生まれる。クリック処理は親（<button> 等）側で行う。

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

export default function ParallaxImage({
  src,
  alt,
  amount = 12,
  className,
  imgClassName = "object-cover",
  sizes,
  priority = false,
  style,
}: {
  src: string;
  alt: string;
  amount?: number;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.4, restDelta: 0.001 });
  const y = useTransform(smooth, [0, 1], reduce ? ["0%", "0%"] : [`-${amount}%`, `${amount}%`]);

  return (
    <div ref={ref} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      <motion.div
        style={{
          y,
          position: "absolute",
          left: 0,
          right: 0,
          top: `-${amount}%`,
          height: `${100 + amount * 2}%`,
        }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} className={imgClassName} priority={priority} />
      </motion.div>
    </div>
  );
}
