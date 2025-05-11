"use client"

import { useState } from "react"
import type { ChangeEvent } from "react"

export default function DescriptionHelperPage() {
  const [inputText, setInputText] = useState("")
  const [generatedDescription, setGeneratedDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle input changes in the text area
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  // Handle the description generation logic
  const handleGenerateDescription = async () => {
    setLoading(true) // Show loading state
    try {
      // Sending input text to backend API to generate description
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText }),
      })

      const data = await response.json()

      // If the response is okay, update the generated description
      if (response.ok) {
        setGeneratedDescription(data.description)
      } else {
        setGeneratedDescription("Failed to generate description.")
      }
    } catch (error) {
      // Handle errors
      console.error("Error generating description:", error)
      setGeneratedDescription("An error occurred. Please try again.")
    }
    setLoading(false) // Hide loading state
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>AI-Powered Description Helper</h1>

      {/* Text area to input description details */}
      <textarea
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter product details or description prompt..."
        rows={4}
        cols={50}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <br />

      {/* Button to trigger description generation */}
      <button
        onClick={handleGenerateDescription}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Description"}
      </button>

      {/* Show generated description or error message */}
      {generatedDescription && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
          <h2>Generated Description:</h2>
          <p>{generatedDescription}</p>
        </div>
      )}
    </div>
  )
}
