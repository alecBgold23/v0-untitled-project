"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function uploadImagePrivate(file: File, email: string) {
  const fileName = `${email}-${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage.from("images2").upload(fileName, file)

  if (error) {
    console.error("Upload error:", error)
    return { success: false }
  }

  // Optionally generate a signed URL
  const { data: signedUrlData } = await supabase.storage.from("images2").createSignedUrl(fileName, 60 * 60) // 1 hour

  return {
    success: true,
    path: fileName,
    signedUrl: signedUrlData?.signedUrl,
  }
}
