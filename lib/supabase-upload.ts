import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const defaultBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "item_images"

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to get the bucket name with fallback
export function getBucketName(): string {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET
  if (!bucket) {
    console.warn("NEXT_PUBLIC_SUPABASE_BUCKET is not defined, using default bucket: item_images")
    return "item_images"
  }
  return bucket
}

// Function to ensure the URL has the correct format with bucket name
export function formatImageUrl(url: string, bucket = getBucketName()): string {
  if (!url) return ""

  // If the URL already contains the bucket name, return it
  if (url.includes(`/public/${bucket}/`)) return url

  // Extract the Supabase project URL
  const projectUrlMatch = url.match(/(https:\/\/[^/]+)/)
  if (!projectUrlMatch) return url

  const projectUrl = projectUrlMatch[1]

  // Extract the file path after the last slash
  const pathParts = url.split("/")
  const fileName = pathParts[pathParts.length - 1]

  // Construct the correct URL format
  return `${projectUrl}/storage/v1/object/public/${bucket}/${fileName}`
}

// Function to upload a file to Supabase
export async function uploadFile(file: File, customPath?: string) {
  try {
    if (!file) {
      throw new Error("No file provided")
    }

    // Get the bucket name from environment variable
    const bucket = getBucketName()

    // Create a unique file path
    const filePath = customPath || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    console.log(`Uploading file to bucket: ${bucket}, path: ${filePath}`)

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite if file exists
    })

    if (error) {
      console.error("Error uploading file:", error)
      throw error
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    // Format the URL to ensure it's correct
    const formattedUrl = formatImageUrl(publicUrlData.publicUrl, bucket)

    console.log("File uploaded successfully:", formattedUrl)

    return {
      success: true,
      path: data.path,
      url: formattedUrl,
      publicUrl: formattedUrl,
      bucket: bucket,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    }
  }
}

// Function to check if the bucket exists and is accessible
export async function checkBucket(bucketName = getBucketName()) {
  try {
    const { data, error } = await supabase.storage.from(bucketName).list()

    if (error) {
      console.error(`Error accessing bucket ${bucketName}:`, error)
      return {
        success: false,
        error: `Cannot access bucket ${bucketName}: ${error.message}`,
      }
    }

    return {
      success: true,
      message: `Successfully accessed bucket ${bucketName}`,
      files: data?.length || 0,
    }
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking bucket",
    }
  }
}

// Function to create the bucket if it doesn't exist (requires service role key)
export async function createBucket(bucketName = getBucketName()) {
  try {
    // This requires the service role key, so it should only be used server-side
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return {
        success: false,
        error: "SUPABASE_SERVICE_ROLE_KEY is required to create buckets",
      }
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey)

    // Check if bucket exists
    const { data: buckets, error: listError } = await adminSupabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, error: listError.message }
    }

    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      // Create the bucket
      const { data, error } = await adminSupabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error)
        return { success: false, error: error.message }
      }

      console.log(`Successfully created bucket ${bucketName}`)
      return { success: true, message: `Created bucket ${bucketName}` }
    }

    console.log(`Bucket ${bucketName} already exists`)
    return { success: true, message: `Bucket ${bucketName} already exists` }
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
