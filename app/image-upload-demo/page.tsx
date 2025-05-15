"use client"

import type React from "react"

import { useState } from "react"
import supabase from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ImageUploadDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<{ url: string; name: string }[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setSuccess(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create a unique file path
      const filePath = `uploads/${Date.now()}-${file.name}`

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("images") // your bucket name
        .upload(filePath, file)

      if (error) {
        throw new Error(`Upload error: ${error.message}`)
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filePath)

      // Now insert the metadata into the 'images' table
      const { error: dbError } = await supabase.from("images").insert({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        public_url: publicUrlData.publicUrl,
      })

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      setSuccess("Image uploaded successfully!")
      setUploadedImages((prev) => [...prev, { url: publicUrlData.publicUrl, name: file.name }])
      setFile(null)

      // Reset the file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Supabase Image Upload Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload an Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-input")?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
              <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {file && <span className="text-sm">{file.name}</span>}
            </div>

            {file && (
              <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Upload to Supabase</>
                )}
              </Button>
            )}

            {error && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No images uploaded yet</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 text-xs truncate bg-gray-50">{image.name}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const filePath = \`uploads/\${file.name}\`;

const { data, error } = await supabase.storage
  .from('images') // <-- your bucket name
  .upload(filePath, file); // <-- actual File or Blob object

if (error) {
  console.error('Upload error:', error);
} else {
  const publicUrl = supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl;

  // Now insert the metadata into the 'images' table
  await supabase.from('images').insert({
    file_name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    public_url: publicUrl
  });
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
