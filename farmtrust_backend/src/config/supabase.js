import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_KEY loaded:", !!process.env.SUPABASE_SERVICE_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

try {
  console.log("✅ Supabase client initialized successfully");
} catch (error) {
  console.error("❌ Supabase initialization error:", error.message);
}

export default supabase;
