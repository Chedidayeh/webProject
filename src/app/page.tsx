/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import RequestForm from "@/components/RequestForm";
import { useState } from "react";
import { sendHttpRequest } from "./actions";
import { Method } from "axios";


interface HttpResponse {
  status: number;
  statusText : string
  headers: Record<string, string>;
  data: any; // Use any for generalization, but you can specify more if you know the type
}



export default function Home() {
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission from RequestForm component
  const handleRequestSubmit = async (url: string, method: Method, body: string) => {
    setResponse(null);  // Reset response on each request
    setError(null);     // Reset error on each request
    

    // Send the HTTP request
    const result = await sendHttpRequest({ url, method, body });

    // Update response or error state based on result
// Update this part in your handleRequestSubmit function
// Update response or error state based on result
    if (result.success) {
      setResponse({
        status: result.status!,        // Store the status code
        statusText: result.statusText!, // Store the status text
        headers: result.headers!,      // Store the headers
        data: result.data              // Store the body
      });

    } else {
      setError(result.error!); // Display error message
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">HTTP Request Client</h1>
      {/* Render RequestForm and pass handleRequestSubmit as onSubmit */}
      <RequestForm onSubmit={handleRequestSubmit} />

      {/* Response Output */}
      <div className="mt-6">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            <h2 className="font-semibold">Error:</h2>
            <pre>{error}</pre>
          </div>
        )}
        
        {response && (
          <div className="p-4 bg-green-100 text-green-700 rounded space-y-4">
            {/* Status Code */}
            <div>
              <h2 className="font-semibold text-gray-800">Status Code:</h2>
              <p>{response.status}</p>
            </div>
            
            {/* Response Headers */}
            <div>
              <h2 className="font-semibold text-gray-800">Headers:</h2>
              <div className="p-2 bg-gray-50 border rounded">
                <pre>{JSON.stringify(response.headers, null, 2)}</pre>
              </div>
            </div>

            {/* Response Body */}
            <div>
              <h2 className="font-semibold text-gray-800">Body:</h2>
              <div className="p-2 bg-gray-50 border rounded">
                {typeof response.data === 'object' ? (
                  <pre>{JSON.stringify(response.data, null, 2)}</pre>
                ) : (
                  <pre>{response.data}</pre>
                )}
              </div>
            </div>





          </div>
        )}
      </div>



    </div>
  );
};
