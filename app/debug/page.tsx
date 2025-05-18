import { SupabaseConnectionTest } from "@/components/supabase-connection-test"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Debug Tools</h1>
      <SupabaseConnectionTest />
    </div>
  )
}
