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

// Add a new function to upload an image from a URL
export async function uploadImageFromUrl(imageUrl: string, userId: string) {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Get the image data as a blob
    const imageBlob = await response.blob()

    // Determine file extension from content type or URL
    let fileExt = "jpg" // Default extension
    const contentType = response.headers.get("content-type")
    if (contentType) {
      if (contentType.includes("png")) fileExt = "png"
      else if (contentType.includes("gif")) fileExt = "gif"
      else if (contentType.includes("webp")) fileExt = "webp"
      else if (contentType.includes("svg")) fileExt = "svg"
    } else {
      // Try to get extension from URL
      const urlExt = imageUrl.split(".").pop()?.toLowerCase()
      if (urlExt && ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(urlExt)) {
        fileExt = urlExt === "jpeg" ? "jpg" : urlExt
      }
    }

    // Create a unique filename
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload the blob to Supabase storage
    const { data, error } = await supabase.storage.from("images").upload(fileName, imageBlob, {
      contentType: contentType || `image/${fileExt}`,
    })

    if (error) {
      console.error("Error uploading image from URL:", error)
      return null
    }

    return data?.path
  } catch (error) {
    console.error("Error in uploadImageFromUrl:", error)
    return null
  }
}

// Update the getFileUrl function to create signed URLs with expiration instead of public URLs
export async function getFileUrl(path: string) {
  // Create a signed URL that expires in 1 hour (3600 seconds)
  const { data, error } = await supabase.storage.from("images").createSignedUrl(path, 3600)

  if (error) {
    console.error("Error creating signed URL:", error)
    return null
  }

  return data?.signedUrl
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
