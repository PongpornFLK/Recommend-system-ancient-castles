import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://phejqfklpipcjemjgydt.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZWpxZmtscGlwY2plbWpneWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODA0MTMsImV4cCI6MjA4ODQ1NjQxM30.unsAdwbc5myUmlydxbqu9Josu1f42YXVheExIlce9B4'

export const supabase = createClient(supabaseUrl, supabaseKey)