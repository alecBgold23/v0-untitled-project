"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Define a simple User type without Firebase dependencies
type User = {
  id: string
  email: string
  displayName?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    // Check localStorage or cookies for existing session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user", e)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string) => {
    // Simulate signup - in a real app, this would call your API
    setLoading(true)
    try {
      // Create a new user
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        displayName: email.split("@")[0],
      }

      // Store user in localStorage (for demo purposes)
      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    // Simulate signin - in a real app, this would call your API
    setLoading(true)
    try {
      // Create a user object (in a real app, this would come from your backend)
      const user = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        displayName: email.split("@")[0],
      }

      // Store user in localStorage (for demo purposes)
      localStorage.setItem("user", JSON.stringify(user))
      setUser(user)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    // Clear the user from state and storage
    localStorage.removeItem("user")
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    // Simulate password reset - in a real app, this would call your API
    console.log(`Password reset email sent to ${email}`)
    // This would typically trigger an email to the user
  }

  const updateUserProfile = async (displayName: string) => {
    if (!user) throw new Error("No user is signed in")

    // Update the user's profile
    const updatedUser = { ...user, displayName }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
