// API configuration
// In production (Render), frontend is served by the same backend — use relative URLs
// In development (local), VITE_API_URL points to the local backend (http://localhost:4000)

// Determine API base URL:
// 1. If VITE_API_URL is set → use it (works for both dev and explicit prod configs)
// 2. If VITE_API_BASE_URL is set → use it (legacy support)
// 3. In production (non-localhost) → use '' (relative URL, same-origin)
// 4. In development (localhost) → use 'http://localhost:4000'
function getBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  
  // Auto-detect: if running on a non-localhost domain, use same-origin (relative URLs)
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return '';
  }
  
  // Development fallback
  return 'http://localhost:4000';
}

export const API_BASE_URL = getBaseUrl();

// Helper function to build API URLs
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return API_BASE_URL ? `${API_BASE_URL}/${cleanPath}` : `/${cleanPath}`;
};

