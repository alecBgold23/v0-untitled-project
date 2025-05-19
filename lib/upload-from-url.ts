import { uploadImageFromUrl } from "@/app/actions/upload-image-from-url"

/**
 * Utility function to upload an image from a URL to Supabase
 * This can be imported and used in other server actions
 */
export async function uploadFromUrl(
  url: string,
  options?: {
    userId?: string
    fileName?: string
    metadata?: Record<string, string>
  },
) {
  try {
    const result = await uploadImageFromUrl(url, options?.userId || "system", options?.fileName)

    if (!result.success) {
      console.error("Failed to upload image from URL:", result.error)
      return null
    }

    // Return a simplified result object
    return {
      path: result.path,
      url: result.url,
      bucket: result.bucket,
      metadata: options?.metadata || {},
    }
  } catch (error) {
    console.error("Error in uploadFromUrl utility:", error)
    return null
  }
}
