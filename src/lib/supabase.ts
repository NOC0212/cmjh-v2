import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED = !!(supabaseUrl && supabaseAnonKey);

if (!SUPABASE_ENABLED) {
  console.warn(
    "Supabase 環境變數未設定，訪問計數器將停用。\n" +
      "請將 .env.example 複製為 .env 並填入 Supabase 憑證。",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);
