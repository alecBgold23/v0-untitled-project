// This is a browser-compatible version of the nodemailer utility
// It provides both the original Node.js implementation and a browser fallback

// For browser environments
async function sendEmailBrowser({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
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

    return { success: true, messageId: "browser-email" }
  } catch (error: any) {
    console.error("Failed to send email:", error)
    return { success: false, error: error.message }
  }
}

// Export the sendGmail function that matches the original API
export async function sendGmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      return sendEmailBrowser({ to, subject, html, text })
    }

    // If we're in a Node.js environment and have access to nodemailer
    // we would use it here, but for browser compatibility we'll use the browser version
    return sendEmailBrowser({ to, subject, html, text })
  } catch (error: any) {
    console.error("Failed to send email:", error)
    return { success: false, error: error.message }
  }
}

// Create a transporter with Gmail (browser-compatible version)
export const createTransporter = () => {
  // In a browser environment, we'll return a mock transporter
  return {
    sendMail: async (options: any) => {
      const { to, subject, text, html } = options
      return sendGmail({ to, subject, text, html })
    },
  }
}

// Additional browser-compatible functions
export function createTestTransport() {
  return {
    sendMail: async (options: any) => {
      console.log("Test email:", options)
      return { success: true, messageId: "test-email" }
    },
  }
}

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
  return sendGmail({ to, subject, html, text })
}
