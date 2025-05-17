"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useRef } from "react"
import { useInView } from "framer-motion"

interface ContentAnimationProps {
  children: ReactNode
  delay?: number
  className?: string
  duration?: number
  animation?: "fadeUp" | "fadeIn" | "fadeLeft" | "fadeRight"
}

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
}

export default function ContentAnimation({
  children,
  delay = 0,
  className = "",
  duration,
  animation = "fadeUp",
}: ContentAnimationProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

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
      className={`content-animation-wrapper ${className}`}
    >
      {children}
    </motion.div>
  )
}
