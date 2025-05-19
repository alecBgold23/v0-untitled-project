import { createClient } from "@supabase/supabase-js"

// Create a singleton Supabase admin client
let supabaseAdmin: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin credentials")
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  return supabaseAdmin
}

// Initialize required storage buckets
export async function initializeStorage() {
  try {
    const supabase = getSupabaseAdmin()

    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, error: listError.message }
    }

    // Define required buckets with their configurations
    const requiredBuckets = [
      { name: "images", public: true },
      { name: "uploads", public: true },
      { name: "itemimages", public: true },
    ]

    // Create any missing buckets
    const results = []
    for (const bucket of requiredBuckets) {
      if (!buckets.some((b) => b.name === bucket.name)) {
        console.log(`Creating bucket: ${bucket.name}`)
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
        })

        if (error) {
          console.error(`Error creating bucket ${bucket.name}:`, error)
          results.push({ bucket: bucket.name, success: false, error: error.message })
        } else {
          results.push({ bucket: bucket.name, success: true })
        }
      } else {
        // Update existing bucket if needed
        if (bucket.public) {
          await supabase.storage.updateBucket(bucket.name, {
            public: true,
          })
        }
        results.push({ bucket: bucket.name, success: true, exists: true })
      }
    }

    return { success: true, results }
  } catch (error) {
    console.error("Error initializing storage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Initialize required database tables
export async function initializeDatabase() {
  try {
    const supabase = getSupabaseAdmin()

    // Check if sell_items table exists
    const { error: checkError } = await supabase.from("sell_items").select("id").limit(1).single()

    // If table doesn't exist, create it
    if (checkError && checkError.code === "PGRST116") {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc("create_sell_items_table")

      if (createError) {
        // If RPC function doesn't exist, create table directly
        const { error: sqlError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS sell_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            item_name TEXT NOT NULL,
            item_description TEXT NOT NULL,
            image_path TEXT,
            email TEXT,
            item_condition TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            full_name TEXT,
            pickup_date TEXT,
            status TEXT DEFAULT 'pending',
            submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            estimated_price TEXT,
            image_paths TEXT[],
            image_urls TEXT[]
          );
        `

        if (sqlError) {
          console.error("Error creating sell_items table:", sqlError)
          return { success: false, error: sqlError.message }
        }
      }

      return { success: true, message: "Created sell_items table" }
    }

    return { success: true, message: "Database tables already exist" }
  } catch (error) {
    console.error("Error initializing database:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Function to test Supabase connection
export async function testSupabaseConnection() {
  try {
    const supabase = getSupabaseAdmin()

    // Simple query to test connection
    const { data, error } = await supabase.from("sell_items").select("count(*)").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
