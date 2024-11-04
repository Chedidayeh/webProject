/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Method } from 'axios';
import React, { useState } from 'react';


const httpMethods: {
  'HTTP1.0': string[];
  'HTTP1.1': string[];
} = {
  'HTTP1.0': ['GET', 'POST', 'HEAD'],
  'HTTP1.1': ['GET', 'POST', 'PUT', 'DELETE', 'HEAD']
};

type HttpVersion = 'HTTP1.0' | 'HTTP1.1';


const httpVersions: HttpVersion[] = ['HTTP1.0', 'HTTP1.1'];



const RequestForm: React.FC<{ onSubmit: (url: string, method: Method, body: string) => void }> = ({ onSubmit }) => {
  // State variables

  
  const [url, setUrl] = useState<string>('');
  const [method, setMethod] = useState<string>('GET');
  const [version, setVersion] = useState<HttpVersion>('HTTP1.0');
  const [body, setBody] = useState<string>('');

    // Reset all fields
    const clearForm = () => {
      setUrl('');
      setMethod('GET');
      setBody('');
    };

  // Handle URL change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value);

  // Handle HTTP version change and reset method if it’s not allowed in the selected version
  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVersion = e.target.value as HttpVersion;
    setVersion(selectedVersion);

    // Reset to a valid method if the current method isn't supported by the selected version
    if (!httpMethods[selectedVersion].includes(method)) {
      setMethod(httpMethods[selectedVersion][0]);
    }
  };

  // Handle HTTP method change
  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => setMethod(e.target.value);

  // Handle body change
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value);

  // Handle form submission
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();


  // If the method is POST, allow empty body
  if (method === 'POST' && body === '') {
    // Notify user about sending an empty body
    alert('You are about to send a POST request with an empty body.');
    return;
  } else if (body && (method === 'POST' || method === 'PUT')) {
    try {
      JSON.parse(body); // Validate JSON format
    } catch {
      alert('Invalid JSON format. Please correct it before submitting.');
      return;
    }
  }

  // Pass fullUrl instead of url to the onSubmit function
  onSubmit(url, method as Method, body);
};

  

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded shadow-md space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">URL</label>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          className="mt-1 p-2 border rounded w-full"
          placeholder="Enter request URL"
          required
        />
      </div>

            {/* HTTP version */}
      <div>
        <label className="block text-sm font-medium text-gray-700">HTTP Version</label>
        <select
          value={version}
          onChange={handleVersionChange}
          className="mt-1 p-2 border rounded w-full"
        >
          {httpVersions.map((v) => (
            <option key={v} value={v}>
              {v.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* HTTP Method Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Method</label>
        <select
          value={method}
          onChange={handleMethodChange}
          className="mt-1 p-2 border rounded w-full"
        >
          {httpMethods[version].map((m) => (
            <option key={m} value={m}>
              {m.toUpperCase()}
            </option>
          ))}
        </select>
      </div>


      {/* Body Section */}
      {method != 'GET' && method != 'DELETE' && method != 'HEAD'  && (

      <div>
        <label className="block text-sm font-medium text-gray-700">Body</label>
        <textarea
          value={body}
          onChange={handleBodyChange}
          rows={5}
          className="mt-1 p-2 border rounded w-full"
          placeholder="Enter JSON body (for POST/PUT)"
        >

        </textarea>
      </div>
      )}

      {/* Submit Button */}
      <div>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Send Request
        </button>
      </div>

      <div className="flex space-x-4">
        <button type="button" onClick={clearForm} className="p-2 bg-gray-300 text-gray-700 rounded">Clear</button>
      </div>
    </form>
  );
};

export default RequestForm;
