
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
  // Make sure to explicitly set Accept header to application/json
  const headers = {
    'Content-Type': 'application/json',
    'Origin': FRONTEND_URL,
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Helps identify AJAX requests
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
    
    // Get the content type to determine how to process the response
    const contentType = response.headers.get('Content-Type');
    
    // Clone the response to avoid consuming it
    const responseClone = response.clone();
    
    // Always try to get the text first to diagnose issues
    const rawText = await responseClone.text();
    
    // Special handling for movies endpoint which might return HTML
    if (endpoint.includes('/movies')) {
      console.log('Processing movies endpoint response, first 100 chars:', rawText.substring(0, 100));
      
      // Check if the raw text looks like JSON despite content type
      if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        try {
          const jsonData = JSON.parse(rawText);
          console.log('Successfully parsed movies JSON data from response');
          return jsonData;
        } catch (e) {
          console.error('Failed to parse text as JSON despite JSON-like format:', e);
          // Fall through to other handling methods
        }
      }
      
      // If we got HTML with a login page or similar, look for typical HTML markers
      if (rawText.includes('<!DOCTYPE html>') || rawText.includes('<html')) {
        console.error('Server returned HTML instead of JSON. HTML snippet:', rawText.substring(0, 200));
        throw new Error('Server returned a webpage instead of JSON data. Please check API configuration.');
      }
    }
    
    // Universal response handling based on content
    if (!response.ok) {
      // Try to parse error response first as JSON
      try {
        if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
          const errorData = JSON.parse(rawText);
          console.error('API error response:', errorData);
          throw new Error(errorData.message || `API request failed with status: ${response.status}`);
        } else {
          console.error('Non-JSON error response:', rawText.substring(0, 200));
          throw new Error(`API request failed with status: ${response.status}. Server did not return valid JSON.`);
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error(`API request failed with status: ${response.status}. ${e.message}`);
      }
    }
    
    // For successful responses, let's try to be smart about parsing
    try {
      // Check if the raw text starts with { or [ indicating JSON
      if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        const jsonData = JSON.parse(rawText);
        
        if (endpoint.includes('/movies') || endpoint.includes('/showtimes')) {
          console.log(`${endpoint} response format:`, {
            isArray: Array.isArray(jsonData),
            type: typeof jsonData,
            keys: typeof jsonData === 'object' && jsonData !== null ? Object.keys(jsonData) : []
          });
        }
        
        return jsonData;
      } else if (contentType && contentType.includes('text/html')) {
        // We got HTML when expecting JSON
        console.error('Server returned HTML instead of JSON:', rawText.substring(0, 200));
        throw new Error('Server returned HTML when JSON was expected. Check API configuration.');
      } else {
        // Not JSON and not HTML - return text content
        console.warn('Response is not JSON or HTML. Returning raw text.');
        return rawText;
      }
    } catch (e) {
      console.error('Error processing response:', e);
      throw new Error(`Failed to process API response: ${e.message}`);
    }
  } catch (error) {
    console.error('Proxy fetch error:', error);
    throw error;
  }
};
