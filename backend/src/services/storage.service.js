import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'streetly-photos';

/**
 * Returns a short-lived signed upload target. The frontend uploads the
 * photo directly to Supabase Storage from the browser using this path
 * + token (via supabase-js's uploadToSignedUrl) — the image bytes never
 * pass through this server.
 *
 * The service role key used here is secret and stays server-side only.
 * The frontend only ever sees the path/token pair, which is scoped to
 * one file and expires.
 */
export async function createSignedUpload({ contentType }) {
  if (!ALLOWED_TYPES.has(contentType)) {
    throw Object.assign(new Error('Unsupported image type.'), { status: 400 });
  }

  const ext = contentType.split('/')[1];
  const path = `reports/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) {
    throw Object.assign(new Error('Could not create an upload URL.'), { status: 500 });
  }

  // Bucket must be public (set this once in the Supabase dashboard) for
  // this URL pattern to be viewable without a separate signed read URL.
  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  return { path: data.path, token: data.token, publicUrl };
}
