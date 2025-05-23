/**
 * Content filter utility to check for inappropriate or blocked terms
 */
export function isBlockedContent(text: string): boolean {
  if (!text) return false

  const blockedTerms = ["whore", "nathan shub"]
  const normalizedText = text.toLowerCase().trim()

  return blockedTerms.some((term) => normalizedText.includes(term.toLowerCase()))
}
