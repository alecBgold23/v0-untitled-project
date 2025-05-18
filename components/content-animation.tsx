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
      visible: {
        opacity: 1,
        transition: {
          duration,
          ease: "easeOut",
        },
      },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier easing for smoother motion
        },
      },
    },
    slideIn: {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration,
          ease: [0.25, 0.1, 0.25, 1.0],
        },
      },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration,
          ease: [0.34, 1.56, 0.64, 1], // spring-like easing
        },
      },
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
      viewport={{ once: true, margin: "-10%" }}
      variants={selectedVariant}
      transition={{
        delay,
        staggerChildren: 0.1,
        delayChildren: delay,
      }}
    >
      {children}
    </motion.div>
  )
}
