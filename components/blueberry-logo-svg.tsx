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

      {/* Purple flower */}
      <path
        d="M256 150
           C290 150 310 180 310 210
           C310 240 290 270 256 270
           C222 270 202 240 202 210
           C202 180 222 150 256 150Z"
        fill="#9333EA"
      />
      <path
        d="M256 150
           C256 184 226 204 196 204
           C166 204 136 184 136 150
           C136 116 166 96 196 96
           C226 96 256 116 256 150Z"
        fill="#9333EA"
      />
      <path
        d="M256 150
           C256 116 286 96 316 96
           C346 96 376 116 376 150
           C376 184 346 204 316 204
           C286 204 256 184 256 150Z"
        fill="#9333EA"
      />

      {/* White center */}
      <circle cx="256" cy="150" r="25" fill="white" />
    </svg>
  )
}
