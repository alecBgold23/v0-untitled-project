/**
 * Upload an image to the server
 * @param file File to upload
 * @returns Object with the uploaded image URL or an error
 */
export async function uploadImage(file: File): Promise<{ url: string } | { error: string }> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { error: errorText || "Failed to upload image" }
    }

    const data = await response.json()
    return { url: data.url }
  } catch (error: any) {
    return { error: error.message || "Failed to upload image" }
  }
}
