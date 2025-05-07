"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, type ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [showBlueLine, setShowBlueLine] = useState(false)
  const previousPathRef = useRef(pathname)

  useEffect(() => {
    // Only trigger blue line when pathname changes
    if (pathname !== previousPathRef.current) {
      // Show blue line
      setShowBlueLine(true)

      // Hide blue line after 100ms
      const timer = setTimeout(() => {
        setShowBlueLine(false)
      }, 100)

      previousPathRef.current = pathname
      return () => clearTimeout(timer)
    }
  }, [pathname])

  return (
    <>
      {/* Blue line indicator */}
      {showBlueLine && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 z-[9999]" style={{ transition: "none" }} />
      )}
      {/* Page content with no transitions */}
      <div className="page-content" style={{ transition: "none" }}>
        {children}
      </div>
    </>
  )
}
