import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadFile(file: File, userId: string) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { data, error } = await supabase.storage
    .from("images") // your bucket name here
    .upload(filePath, file)

  if (error) {
    console.error("Error uploading file:", error)
    return null
  }

  return data?.path
}

export async function getFileUrl(path: string) {
  const { data } = supabase.storage.from("images").getPublicUrl(path)

  return data?.publicUrl
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage.from("images").remove([path])

  if (error) {
    console.error("Error deleting file:", error)
    return false
  }

  return true
}

export async function listFiles(userId: string) {
  const { data, error } = await supabase.storage.from("images").list(userId)

  if (error) {
    console.error("Error listing files:", error)
    return []
  }

  return data || []
}
