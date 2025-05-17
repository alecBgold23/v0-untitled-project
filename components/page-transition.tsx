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

  // Set all transition durations to 0
  const variants = {
    hidden: { opacity: 0, x: 0, y: 20 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 0, y: 20 },
  }

  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{ duration: 0, type: "linear" }}
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
