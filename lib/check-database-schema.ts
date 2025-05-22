import { getSupabaseAdmin } from "./supabase-admin"

export async function checkTableColumns(tableName: string) {
  try {
    const supabase = getSupabaseAdmin()

    // Use raw SQL to check table columns
    const { data, error } = await supabase.rpc("execute_sql", {
      query: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' AND table_schema = 'public';
      `,
    })

    if (error) {
      console.error(`Error checking columns for table ${tableName}:`, error)
      return { success: false, error }
    }

    return { success: true, columns: data }
  } catch (err) {
    console.error(`Unexpected error checking columns for table ${tableName}:`, err)
    return { success: false, error: err }
  }
}

export async function makeColumnNullable(tableName: string, columnName: string) {
  try {
    const supabase = getSupabaseAdmin()

    // Use raw SQL to make column nullable
    const { data, error } = await supabase.rpc("execute_sql", {
      query: `ALTER TABLE ${tableName} ALTER COLUMN ${columnName} DROP NOT NULL;`,
    })

    if (error) {
      console.error(`Error making column ${columnName} nullable:`, error)
      return { success: false, error }
    }

    return { success: true, message: `Column ${columnName} is now nullable` }
  } catch (err) {
    console.error(`Unexpected error making column ${columnName} nullable:`, err)
    return { success: false, error: err }
  }
}
