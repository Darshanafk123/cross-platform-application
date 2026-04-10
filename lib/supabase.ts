import { createClient } from "@supabase/supabase-js";


export const supabase = createClient(
  "https://lkcvgcuyxnuoncdumcas.supabase.co", // 👈 your URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrY3ZnY3V5eG51b25jZHVtY2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzE2NjksImV4cCI6MjA5MTQwNzY2OX0.jwuW6L25T93eGgcNdmmAvDdjBd0VXSngAtEiGFsZVbg",                        // 👈 your anon key

);