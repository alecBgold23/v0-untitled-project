"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface ContentAnimationProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function ContentAnimation({ children, delay = 0, className = "" }: ContentAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay,
      }}
      className={`content-animation-wrapper ${className}`}
    >
      {children}
    </motion.div>
  )
}
