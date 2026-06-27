import { createClient } from '@supabase/supabase-js';

// Anon key only — this client can never act as the service role.
// What it's allowed to do is governed entirely by storage policies
// set on the bucket in the Supabase dashboard.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'streetly-photos';
