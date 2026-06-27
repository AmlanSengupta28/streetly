import { supabase, STORAGE_BUCKET } from './supabaseClient.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  listReports: ({ lat, lng, radiusKm, q, limit, offset } = {}) => {
    const params = new URLSearchParams();
    if (q) {
      params.set('q', q);
    } else if (lat != null && lng != null) {
      params.set('lat', lat);
      params.set('lng', lng);
      if (radiusKm) params.set('radiusKm', radiusKm);
    }
    if (limit) params.set('limit', limit);
    if (offset) params.set('offset', offset);
    return request(`/reports?${params.toString()}`);
  },
  getReport: (id) => request(`/reports/${id}`),
  createReport: (data) => request('/reports', { method: 'POST', body: JSON.stringify(data) }),
  flagReport: (id) => request(`/reports/${id}/flag`, { method: 'POST' }),
  getAreaRollup: () => request('/reports/areas/rollup'),
  presignUpload: (contentType) =>
    request('/uploads/presign', { method: 'POST', body: JSON.stringify({ contentType }) }),
};

/**
 * Uploads a photo: the backend issues a signed path+token scoped to one
 * file (via the secret service role key, never exposed here), then
 * supabase-js uploads the bytes straight to Supabase Storage using that
 * token. Returns the public URL to save on the report.
 */
export async function uploadPhoto(blob) {
  const { path, token, publicUrl } = await api.presignUpload(blob.type);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).uploadToSignedUrl(path, token, blob);
  if (error) throw new Error('Photo upload failed.');
  return publicUrl;
}
