
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
        const htmlContent = await response.text();
        console.error('Server returned HTML response:', htmlContent.substring(0, 200) + '...');
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
      // Try to handle the HTML response
      const htmlContent = await response.text();
      console.error('Server returned HTML response body:', htmlContent.substring(0, 200) + '...');
      
      // Check if the HTML actually contains JSON data (some APIs return JSON with wrong content type)
      try {
        // Check if the response starts with a { or [ indicating JSON
        if (htmlContent.trim().startsWith('{') || htmlContent.trim().startsWith('[')) {
          console.log('Found JSON content in HTML response, attempting to parse');
          const jsonData = JSON.parse(htmlContent);
          console.log('Successfully parsed JSON from HTML response');
          return jsonData;
        }
      } catch (e) {
        console.error('Failed to extract JSON from HTML response:', e);
      }
      
      throw new Error('Server returned HTML instead of JSON. The API endpoint may be incorrect or the server might be returning a login page.');
    }
    
    // Try to parse as JSON
    try {
      // For /movies endpoint, attempt a different approach if needed
      if (endpoint.includes('/movies')) {
        try {
          const text = await response.text();
          console.log('Raw text response from movies endpoint:', text.substring(0, 200));
          
          // Check if the text starts with a { or [ indicating JSON
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            try {
              const jsonData = JSON.parse(text);
              console.log('Successfully parsed JSON from text response');
              
              // Log the response format for debugging
              console.log('Movies response format:', {
                isArray: Array.isArray(jsonData),
                type: typeof jsonData,
                keys: typeof jsonData === 'object' && jsonData !== null ? Object.keys(jsonData) : []
              });
              
              return jsonData;
            } catch (e) {
              console.error('Failed to parse text as JSON:', e);
              throw new Error('Server returned invalid JSON. Please check if the API endpoint is correct.');
            }
          } else {
            console.error('Response is not valid JSON (does not start with { or [)');
            throw new Error('Server returned invalid data format. Please check the API endpoint.');
          }
        } catch (e) {
          console.error('Error handling text response:', e);
          throw e;
        }
      }
      
      // Standard JSON parsing for other endpoints
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
