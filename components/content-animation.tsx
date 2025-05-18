"use client"

import { useEffect, useState, type ReactNode } from "react"
import { motion } from "framer-motion"

interface ContentAnimationProps {
  children: ReactNode
  delay?: number
  duration?: number
  animation?: "fadeIn" | "slideUp" | "slideIn" | "scale"
  className?: string
}

export default function ContentAnimation({
  children,
  delay = 0,
  duration = 0.5,
  animation = "slideUp",
  className = "",
}: ContentAnimationProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Define animation variants
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration } },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration } },
    },
    slideIn: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { duration } },
    },
  }

  // Select the appropriate animation variant
  const selectedVariant = variants[animation]

  // If we're on the server or hydrating, render without animation to avoid hydration mismatch
  if (!isClient) {
    return <div className={className}>{children}</div>
  }

  // On the client, render with animation
  return (
    <motion.div
      className={`content-animation-wrapper ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={selectedVariant}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
