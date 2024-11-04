/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import axios, { Method, AxiosResponse } from 'axios';

type RequestParams = {
  url: string;
  method: Method;
  headers?: Record<string, string>;
  body?: string; // Assume body input is a string (e.g., JSON format)
};

type HttpResponse = {
    success: boolean;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>; // Add this line
    data?: any;
    error?: string;
    responseTime?: number; // In milliseconds
    responseSize?: number; // In bytes
  };
  

  export const sendHttpRequest = async ({
    url,
    method,
    body,
  }: RequestParams): Promise<HttpResponse> => {
    try {
      // Parse body to JSON if applicable
      let parsedBody;
      if (body && (method === 'POST' || method === 'PUT')) {
        try {
          parsedBody = JSON.parse(body); // Convert body to JSON format if it's not empty
        } catch (error) {
          throw new Error('Invalid JSON format in request body.');
        }
      }

      const startTime = Date.now();

  
      // Make the HTTP request with axios
      const response: AxiosResponse = await axios({
        url,
        method,
        data: parsedBody,
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;


          // Convert headers to a plain object with string values
    const headersObject: Record<string, string> = {};
    for (const key in response.headers) {
      if (response.headers[key] !== undefined) {
        headersObject[key] = String(response.headers[key]); // Convert to string
      }
    }

    let responseSize = 0;

        // Check if the response data is an object (JSON) or string
        if (typeof response.data === 'string') {
          responseSize = new TextEncoder().encode(response.data).length;
        } else if (typeof response.data === 'object') {
          // Convert the response to JSON string and calculate size
          responseSize = new TextEncoder().encode(JSON.stringify(response.data)).length;
        }

  
      // Return success result with status, data, headers, etc.
    // Return success result with status, data, headers, etc.
    return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: headersObject, // Include the headers here
        data: response.data,
        responseTime, // Include the response time
        responseSize, // Include the response size
      };
    } catch (error: any) {
      // Extract error message from axios error object
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.statusText}`
        : error.message;
  
      return {
        success: false,
        error: errorMessage,
      };
    }
  };


