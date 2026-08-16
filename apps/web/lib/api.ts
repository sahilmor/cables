const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers: customHeaders, ...customOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...customOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Non-JSON response
    }
    throw new ApiError(response.status, errorMessage, errorData);
  }

  return response.json();
}
