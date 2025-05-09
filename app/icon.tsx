import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 24,
        background: "#2563EB",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        color: "white",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Purple flower */}
        <path
          d="M100 30C113 30 120 40 120 50C120 60 113 70 100 70C87 70 80 60 80 50C80 40 87 30 100 30Z"
          fill="#9333EA"
        />
        <path
          d="M130 40C143 40 150 50 150 60C150 70 143 80 130 80C117 80 110 70 110 60C110 50 117 40 130 40Z"
          fill="#9333EA"
        />
        <path d="M70 40C83 40 90 50 90 60C90 70 83 80 70 80C57 80 50 70 50 60C50 50 57 40 70 40Z" fill="#9333EA" />
        <path
          d="M140 70C153 70 160 80 160 90C160 100 153 110 140 110C127 110 120 100 120 90C120 80 127 70 140 70Z"
          fill="#9333EA"
        />
        <path d="M60 70C73 70 80 80 80 90C80 100 73 110 60 110C47 110 40 100 40 90C40 80 47 70 60 70Z" fill="#9333EA" />

        {/* White center of flower */}
        <circle cx="100" cy="70" r="15" fill="white" />
      </svg>
    </div>,
    // ImageResponse options
    {
      ...size,
    },
  )
}
