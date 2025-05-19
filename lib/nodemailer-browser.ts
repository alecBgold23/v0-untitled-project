/**
 * Browser-compatible version of the sendGmail function
 * This is just a stub that calls the API endpoint
 */
export async function sendGmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
