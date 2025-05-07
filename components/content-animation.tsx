"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface ContentAnimationProps {
  children: ReactNode
  delay?: number
  className?: string
}

// This component will be used to wrap text content that should animate in
export default function ContentAnimation({ children, delay = 0, className = "" }: ContentAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: 0.3,
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
