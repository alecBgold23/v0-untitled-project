"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  linkWithPhoneNumber,
  updatePhoneNumber,
} from "firebase/auth"
import { auth, type RecaptchaVerifier } from "@/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string) => Promise<void>
  linkPhoneNumber: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<any>
  updateUserPhoneNumber: (phoneCredential: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const updateUserProfile = async (displayName: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName })
      // Force refresh the user state
      setUser({ ...auth.currentUser })
    }
  }

  const linkPhoneNumber = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    if (auth.currentUser) {
      return linkWithPhoneNumber(auth.currentUser, phoneNumber, recaptchaVerifier)
    }
    throw new Error("No user is signed in")
  }

  const updateUserPhoneNumber = async (phoneCredential: any) => {
    if (auth.currentUser) {
      await updatePhoneNumber(auth.currentUser, phoneCredential)
      // Force refresh the user state
      setUser({ ...auth.currentUser })
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile,
    linkPhoneNumber,
    updateUserPhoneNumber,
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
