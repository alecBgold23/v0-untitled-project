"use client"

import type React from "react"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isFirstMount, setIsFirstMount] = useState(true)

  // Skip animation on first mount
  useEffect(() => {
    setIsFirstMount(false)
  }, [])

  return (
    <motion.div
      key={pathname}
      initial={isFirstMount ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: [0.33, 1, 0.68, 1], // Custom cubic-bezier for smoother transitions
      }}
      className="w-full h-full bg-background will-change-opacity"
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    >
      {children}
    </motion.div>
  )
}
