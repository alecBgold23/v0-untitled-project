"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, type ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitioning, setTransitioning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // If the pathname changes, start transition
    if (pathname) {
      setTransitioning(true)

      // After a short delay, update the displayed children
      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children)

        // After updating children, end the transition with a slight delay
        timeoutRef.current = setTimeout(() => {
          setTransitioning(false)
        }, 50)
      }, 300)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, children])

  return (
    <div
      className={`transition-opacity duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
        transitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      {displayChildren}
    </div>
  )
}
