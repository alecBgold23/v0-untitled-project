// This is a browser-compatible version of the email utility

/**
 * Send an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Email text content
 * @param html Email HTML content
 * @returns Object indicating success or failure
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // In a browser environment, we'll use the API route instead
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
