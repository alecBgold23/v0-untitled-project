import EnvBucketUploader from "@/components/env-bucket-uploader"
import ServerEnvBucketUploader from "@/components/server-env-bucket-uploader"

export default function EnvBucketUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Upload to Environment Bucket</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Client-side Upload</h2>
          <EnvBucketUploader />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Server-side Upload</h2>
          <ServerEnvBucketUploader />
        </div>
      </div>
    </div>
  )
}
