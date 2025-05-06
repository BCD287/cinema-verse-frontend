
// This is a simple development proxy to handle CORS issues
// It should be used only during development
// In production, the backend should handle CORS properly

import { API_URL, FRONTEND_URL } from '@/lib/constants';

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
    'Origin': FRONTEND_URL,
    'Accept': 'application/json',  // Explicitly request JSON
    ...(options.headers || {}),
    ...proxyOptions.headers,
  };
  
  // Set up the request options
  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors',
    // Add cache control for better reliability with dynamic API endpoints
    cache: 'no-cache',
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
      statusText: response.statusText,
      contentType: response.headers.get('Content-Type')
    });
    
    if (!response.ok) {
      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`Server returned HTML instead of JSON. The API endpoint may be incorrect or the server might be returning a login page.`);
      }
      
      // Try to parse error response
      try {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || `API request failed with status: ${response.status}`);
      } catch (e) {
        console.error('Could not parse error response as JSON');
        throw new Error(`API request failed with status: ${response.status}`);
      }
    }
    
    // For successful responses, check content type first
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Server returned HTML instead of JSON');
      throw new Error('Server returned HTML instead of JSON. The API endpoint may be incorrect or the server might be returning a login page.');
    }
    
    // Try to parse as JSON
    try {
      const responseData = await response.json();
      
      // Log the response format for debugging
      if (endpoint.includes('/showtimes')) {
        console.log('Showtimes response format:', {
          isArray: Array.isArray(responseData),
          type: typeof responseData,
          keys: typeof responseData === 'object' && responseData !== null ? Object.keys(responseData) : []
        });
      }
      
      return responseData;
    } catch (e) {
      console.error('Response is not valid JSON:', e);
      throw new Error('Server returned invalid JSON. Please check if the API endpoint is correct.');
    }
  } catch (error) {
    console.error('Proxy fetch error:', error);
    throw error;
  }
};
