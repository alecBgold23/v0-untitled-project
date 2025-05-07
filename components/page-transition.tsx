"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          y: 10, // Start slightly below final position
        }}
        animate={{
          opacity: 1,
          y: 0, // Move up to final position
        }}
        exit={{
          opacity: 0,
          y: -10, // Exit by moving slightly upward
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier curve for Apple-like feel
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
