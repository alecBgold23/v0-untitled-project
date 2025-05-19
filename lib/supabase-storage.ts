import { getSupabaseClient } from "@/lib/supabase-client"

/**
 * Check if a bucket exists in Supabase storage
 * @param bucket Bucket name
 * @returns Boolean indicating if the bucket exists
 */
export async function bucketExists(bucket: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage.getBucket(bucket)
    return !error && !!data
  } catch (error) {
    return false
  }
}

/**
 * Create a bucket in Supabase storage
 * @param bucket Bucket name
 * @param isPublic Whether the bucket should be public
 * @returns Boolean indicating if the bucket was created successfully
 */
export async function createBucket(bucket: string, isPublic = true): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.storage.createBucket(bucket, {
      public: isPublic,
    })
    return !error
  } catch (error) {
    return false
  }
}

/**
 * Upload a file to Supabase storage
 * @param bucket Bucket name
 * @param path Path within the bucket
 * @param file File to upload
 * @returns Object with the uploaded file URL or an error
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = getSupabaseClient()

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(path, file)

    if (error) {
      return { error: error.message }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    return { url: urlData.publicUrl }
  } catch (error: any) {
    return { error: error.message || "Failed to upload file" }
  }
}
