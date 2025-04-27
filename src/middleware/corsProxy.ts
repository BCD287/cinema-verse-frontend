
// This is a simple development proxy to handle CORS issues
// It should be used only during development
// In production, the backend should handle CORS properly

import { API_URL } from '@/lib/constants';

interface ProxyOptions {
  credentials?: 'include' | 'omit' | 'same-origin';
  headers?: Record<string, string>;
}

export const fetchWithProxy = async (
  endpoint: string,
  options: RequestInit = {},
  proxyOptions: ProxyOptions = {}
) => {
  const url = `${API_URL}${endpoint}`;
  
  // Add default headers for JSON content
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json',
      ...proxyOptions.headers,
    };
  }
  
  // Add CORS mode
  options.mode = 'cors';
  
  // Handle credentials
  if (proxyOptions.credentials) {
    options.credentials = proxyOptions.credentials;
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      } catch (e) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
    }
    
    return response.json();
  } catch (error) {
    console.error('Proxy fetch error:', error);
    throw error;
  }
};
