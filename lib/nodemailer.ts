import nodemailer from "nodemailer"

// Create a transporter with Gmail
const createTransporter = () => {
  const email = process.env.CONTACT_EMAIL
  const password = process.env.EMAIL_PASSWORD

  if (!email || !password) {
    console.error("Email credentials are missing. Please check your environment variables.")
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
    secure: true,
  })
}

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
    const transporter = createTransporter()

    if (!transporter) {
      return {
        success: false,
        error: "Email transporter could not be created. Check your environment variables.",
      }
    }

    const from = process.env.CONTACT_EMAIL || "alecgold808@gmail.com"

    console.log(`Attempting to send email from ${from} to ${to}`)

    const info = await transporter.sendMail({
      from: `"BluBerry Notification" <${from}>`,
      to,
      subject,
      text,
      html,
    })

    console.log("Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error }
  }
}
