import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iflmqossmhrlvmzaxjnf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbG1xb3NzbWhybHZtemF4am5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY1MTcwOCwiZXhwIjoyMTAwMjI3NzA4fQ.hO0WxiLYKovCrFSMUBJi2_-PTETvDFRGiOJRa24kP0M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
