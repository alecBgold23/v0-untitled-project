"use client"
import { useTheme } from "next-themes"

export function BluberryLogoSVG({ width = 40, height = 40 }: { width?: number; height?: number }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={isDark ? "filter brightness-110" : ""}
    >
      {/* Blue circle (berry) */}
      <circle cx="256" cy="256" r="200" fill="#2563EB" />

      {/* Purple flower - updated to match the provided image */}
      <path
        d="M256 120
          C280 120 300 140 320 160
          C340 180 360 200 360 220
          C360 240 340 260 320 280
          C300 300 280 320 256 320
          C232 320 212 300 192 280
          C172 260 152 240 152 220
          C152 200 172 180 192 160
          C212 140 232 120 256 120Z"
        fill="#9333EA"
      />

      {/* Removed the white center */}
    </svg>
  )
}
