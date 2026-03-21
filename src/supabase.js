import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cxgwfnuicystmiokyzcz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Z3dmbnVpY3lzdG1pb2t5emN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzIxMjUsImV4cCI6MjA4OTY0ODEyNX0.GIDPHJTlGuMIQlRhEE4D5CgOD54Fm7NpLknWtPnQNpo'

export const supabase = createClient(supabaseUrl, supabaseKey)
