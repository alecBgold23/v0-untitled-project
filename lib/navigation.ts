"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

export const mainNavItems = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Services",
    href: "/services",
  },
  {
    title: "How It Works",
    href: "/how-it-works",
  },
  {
    title: "FAQ",
    href: "/faq",
  },
  {
    title: "Contact",
    href: "/contact",
  },
]

export const footerNavItems = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Services",
    href: "/services",
  },
  {
    title: "How It Works",
    href: "/how-it-works",
  },
  {
    title: "FAQ",
    href: "/faq",
  },
  {
    title: "Contact",
    href: "/contact",
  },
  {
    title: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    title: "Terms of Service",
    href: "/terms",
  },
]

export const toolsNavItems = [
  {
    title: "Sell Item",
    href: "/sell-item",
    description: "List your item for sale with our easy form",
  },
  {
    title: "Description Generator",
    href: "/tools/description-generator",
    description: "Create compelling descriptions with AI",
  },
  {
    title: "Item Identifier",
    href: "/tools/item-identifier",
    description: "Identify exact models and specifications from basic descriptions",
  },
]

export function useAppNavigation() {
  const router = useRouter()

  const navigateTo = useCallback(
    (path: string, onSuccess?: () => void) => {
      router.push(path)
      onSuccess?.()
    },
    [router],
  )

  return { navigateTo }
}
