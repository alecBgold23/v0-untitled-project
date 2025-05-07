"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, X } from "lucide-react"

// Define search routes and their keywords
const searchRoutes = [
  {
    path: "/sell-item",
    keywords: ["sell", "item", "submit", "selling", "form", "sell your item", "submission"],
    title: "Sell Your Item",
    description: "Submit your item for sale",
  },
  {
    path: "/contact",
    keywords: ["contact", "message", "email", "phone", "reach out", "support", "help", "inquiry"],
    title: "Contact Us",
    description: "Get in touch with our team",
  },
  {
    path: "/how-it-works",
    keywords: ["how", "works", "process", "steps", "guide", "how it works", "explanation"],
    title: "How It Works",
    description: "Learn about our selling process",
  },
  {
    path: "/about",
    keywords: ["about", "company", "mission", "team", "story", "who we are", "about us"],
    title: "About Us",
    description: "Learn about BluBerry",
  },
  {
    path: "/privacy-policy",
    keywords: ["privacy", "policy", "terms", "legal", "data", "information"],
    title: "Privacy Policy",
    description: "Our privacy policy and terms",
  },
  {
    path: "/faq",
    keywords: ["faq", "questions", "answers", "help", "information", "frequently asked questions", "common questions"],
    title: "FAQ",
    description: "Frequently asked questions about our services",
  },
  {
    path: "/reviews",
    keywords: ["reviews", "testimonials", "feedback", "ratings", "experiences", "customer reviews"],
    title: "Reviews",
    description: "See what our customers are saying",
  },
]

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const router = useRouter()
  const inputRef = useRef(null)
  const modalRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query.trim() === "") {
      setSearchResults([])
      return
    }

    // Filter routes based on search query
    const results = searchRoutes.filter((route) => {
      return (
        route.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        route.title.toLowerCase().includes(query) ||
        route.description.toLowerCase().includes(query)
      )
    })

    setSearchResults(results)
  }

  // Handle result click - use router.push for consistent transitions
  const handleResultClick = (path) => {
    router.push(path)
    onClose()
    setSearchQuery("")
    setSearchResults([])
  }

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose()
    } else if (e.key === "Enter" && searchResults.length > 0) {
      handleResultClick(searchResults[0].path)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-200 transform"
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center border-b border-gray-200 p-4">
          <SearchIcon className="h-5 w-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search BluBerry..."
            className="flex-1 outline-none text-base"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onClose} className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 60px)" }}>
          {searchResults.length > 0 ? (
            <ul className="py-2">
              {searchResults.map((result) => (
                <li key={result.path}>
                  <button
                    onClick={() => handleResultClick(result.path)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex flex-col"
                  >
                    <span className="font-medium text-gray-900">{result.title}</span>
                    <span className="text-sm text-gray-500">{result.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.trim() !== "" ? (
            <div className="p-4 text-center text-gray-500">No results found for "{searchQuery}"</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
