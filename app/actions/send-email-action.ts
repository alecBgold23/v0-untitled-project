"use server"

import { Resend } from "resend"

// Initialize Resend client
const resend = new Resend("re_ScJSZp6x_8Gq33AABtqtiMLPUGqGaicCt")

type SendEmailProps = {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
}

export async function sendEmail({ to, subject, text, html, from }: SendEmailProps) {
  try {
    const defaultFrom = "BluBerry <alecgold808@gmail.com>"

    const response = await resend.emails.send({
      from: from || defaultFrom,
      to: [to],
      subject,
      text,
      html,
    })

    return { success: true, data: response }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}
