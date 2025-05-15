"use client"

import { useState } from "react"

export default function DescriptionGenerator() {
  const [title, setTitle] = useState("")
  const [condition, setCondition] = useState("")
  const [extra, setExtra] = useState("")
  const [description, setDescription] = useState("")

  const generate = async () => {
    const res = await fetch("/api/description-helper", {
      method: "POST",
      body: JSON.stringify({ title, condition, extraDetails: extra }),
      headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()
    setDescription(data.description || "No description generated.")
  }

  return (
    <div className="p-4 border rounded max-w-xl space-y-2">
      <input
        placeholder="Item title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        placeholder="Condition (e.g. good, like new)"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        placeholder="Extra details"
        value={extra}
        onChange={(e) => setExtra(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={generate} className="bg-blue-600 text-white px-4 py-2 rounded">
        Generate Description
      </button>

      {description && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <strong>eBay Description:</strong>
          <p>{description}</p>
        </div>
      )}
    </div>
  )
}
