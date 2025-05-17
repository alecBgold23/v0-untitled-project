"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import type { ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: "fadeUp" | "fadeIn" | "scaleUp"
}

export default function AnimatedSection({
  children,
  delay = 0,
  className = "",
  animation = "fadeUp",
}: AnimatedSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Animation variants
  const variants = {
    fadeUp: {
      hidden: { opacity: 0, y: 5 },
      visible: { opacity: 1, y: 0 },
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    scaleUp: {
      hidden: { opacity: 0, scale: 0.98 },
      visible: { opacity: 1, scale: 1 },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants[animation]}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
