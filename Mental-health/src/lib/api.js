export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    body,
    headers = {},
    method = 'GET',
    ...rest
  } = options;

  const requestHeaders = { ...headers };
  const token = localStorage.getItem('token');

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const isJsonBody = body !== undefined && !(body instanceof FormData);
  if (isJsonBody && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: isJsonBody ? JSON.stringify(body) : body,
    ...rest
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return { response, data };
}
