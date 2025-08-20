import { createClient } from "@supabase/supabase-js";

const URL = "https://ynfadavlhbnfbvsjhlib.supabase.co";
const KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluZmFkYXZsaGJuZmJ2c2pobGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc2MDksImV4cCI6MjA3MTEwMzYwOX0.53ehFBli3OpIfB7gtBBBLZWgq7jFnqhW2A2u85pqlqY";

export const supabase = createClient(URL, KEY);
