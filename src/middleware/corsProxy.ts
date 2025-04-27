
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
  
  // Add default headers for JSON content if not already set
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...proxyOptions.headers,
  };
  
  // Set up the request options
  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors',
  };
  
  // Handle credentials
  if (proxyOptions.credentials) {
    requestOptions.credentials = proxyOptions.credentials;
  }
  
  try {
    console.log(`Making request to: ${url}`, { 
      method: options.method || 'GET',
      headers: requestOptions.headers
    });
    
    const response = await fetch(url, requestOptions);
    
    // Log the response status for debugging
    console.log(`Response from ${endpoint}:`, { 
      status: response.status, 
      statusText: response.statusText 
    });
    
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `API request failed with status: ${response.status}`);
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
