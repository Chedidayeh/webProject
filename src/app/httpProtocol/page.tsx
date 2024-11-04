/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable */
"use client";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast';
import { Method } from 'axios';
import React, { useState } from 'react';
import { sendHttpRequest } from '../actions';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import pretty from 'pretty';  // Importing the pretty package
import DOMPurify from 'dompurify';

interface Header {
  key: string;
  value: string;
}

interface QueryParam {
  key: string;
  value: string;
}

const cache: Record<string, HttpResponse> = {};


  
  interface HttpResponse {
    status: number;
    statusText : string
    headers?: Record<string, string>; // Add this line
    data?: any;
    error?: string;
    responseTime?: number; // In milliseconds
    responseSize?: number; // In bytes
  }

  const httpMethods: {
    'HTTP1.0': string[];
    'HTTP1.1': string[];
  } = {
    'HTTP1.0': ['GET', 'POST', 'HEAD'],
    'HTTP1.1': ['GET', 'POST', 'PUT', 'DELETE', 'HEAD']
  };
  
  type HttpVersion = 'HTTP1.0' | 'HTTP1.1';
  
  
  const httpVersions: HttpVersion[] = ['HTTP1.0', 'HTTP1.1'];

const Page = () => {
    const { toast } = useToast()


    const [url, setUrl] = useState<string>('');
    const [method, setMethod] = useState<string>('GET');
    const [version, setVersion] = useState<HttpVersion>('HTTP1.0');
    const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
    const [body, setBody] = useState<string>('');
    const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: '', value: '' }]);
    const [fullUrl, setFullUrl] = useState<string>('');
    // sanitizedHtml state
    const [sanitizedHtml, setSanitizedHtml] = useState<string>('')

     // Helper to define badge color based on status code
  const getBadgeColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500'; // Success
    if (status >= 300 && status < 400) return 'bg-blue-500'; // Redirection
    if (status >= 400 && status < 500) return 'bg-yellow-500'; // Client error
    if (status >= 500) return 'bg-red-500'; // Server error
    return 'bg-gray-500'; // Default/fallback
  };
  
      // Reset all fields
      const clearForm = () => {
        setUrl('');
        setMethod('GET');
        setHeaders([{ key: '', value: '' }]);
        setBody('');
        setQueryParams([{ key: '', value: '' }]);
      };
  
    // Handle URL change
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value);
  
    // Handle HTTP method change
    const handleMethodChange = (e: string) => setMethod(e);
  
    // Handle Header change (dynamic)
    const handleHeaderChange = (index: number, keyOrValue: 'key' | 'value', value: string) => {
      const newHeaders = [...headers];
      newHeaders[index][keyOrValue] = value;
      setHeaders(newHeaders);
    };

      // Handle HTTP version change and reset method if it’s not allowed in the selected version
  const handleVersionChange = (e: string) => {
    const selectedVersion = e as HttpVersion;
    setVersion(selectedVersion);

    // Reset to a valid method if the current method isn't supported by the selected version
    if (!httpMethods[selectedVersion].includes(method)) {
      setMethod(httpMethods[selectedVersion][0]);
    }
  };
  
    // Add new header row
    const addHeaderRow = () => {
      if (headers.length === 0 || headers[headers.length - 1].key || headers[headers.length - 1].value) {
        setHeaders([...headers, { key: '', value: '' }]);
      }
    };  
    // Remove header row
    const removeHeaderRow = (index: number) => {
      const newHeaders = headers.filter((_, i) => i !== index);
      setHeaders(newHeaders);
    };
  
    // Handle Query Parameter change (dynamic)
    const handleQueryParamChange = (index: number, keyOrValue: 'key' | 'value', value: string) => {
      const newQueryParams = [...queryParams];
      newQueryParams[index][keyOrValue] = value;
      setQueryParams(newQueryParams);
      const params = new URLSearchParams();
      queryParams.forEach(param => {
        if (param.key && param.value) {
          params.append(param.key, param.value);
        }
      });
      setFullUrl(url + `?${params.toString()}`);
    };
  
      // Add new query parameter row
      const addQueryParamRow = () => {
        if (queryParams.length === 0 || queryParams[queryParams.length - 1].key || queryParams[queryParams.length - 1].value) {
          setQueryParams([...queryParams, { key: '', value: '' }]);
        }
      };  
      // Remove query parameter row
      const removeQueryParamRow = (index: number) => {
        const newQueryParams = queryParams.filter((_, i) => i !== index);
        setQueryParams(newQueryParams);
      };
  
  
    // Handle body change
    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value);
  
    // Handle form submission
  const handleButtonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    let fullUrl = url;
    if (method === 'GET' && queryParams.length > 0) {
      const params = new URLSearchParams();
      queryParams.forEach(param => {
        if (param.key && param.value) {
          params.append(param.key, param.value);
        }
      });
      fullUrl += `?${params.toString()}`;
      setFullUrl(fullUrl)
    }
  
    // If the method is POST, allow empty body
    if (method === 'POST' && body === '') {
      // Notify user about sending an empty body
      toast({
        title: "You are about to send a POST request with an empty body !",
        variant : "destructive"
      });
      return;
    } else if (body && (method === 'POST' || method === 'PUT')) {
      try {
        JSON.parse(body); // Validate JSON format
      } catch {
        toast({
          title: "Invalid JSON format !",
          description : "Please correct it before submitting.",
          variant : "destructive"
        });
        return;
      }
    }
  
    // Pass fullUrl instead of url to the onSubmit function
    handleRequestSubmit(fullUrl, method as Method, headers, body);
  };


  const [response, setResponse] = useState<HttpResponse | null>();
  const [error, setError] = useState<string | null>(null);

    // Handle form submission from RequestForm component
    const handleRequestSubmit = async (url: string, method: Method, headers: Header[], body: string) => {
        setResponse(null);  // Reset response on each request
        setError(null);     // Reset error on each request
        
        // Convert headers from array to object format
        const headersObj = headers.reduce((acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        }, {} as Record<string, string>);

        const cacheKey = `${method}-${url}`;


            // Check if the response is cached
          if (cache[cacheKey]) {
            setResponse(cache[cacheKey]);
            toast({
              title: "Cached Response Served—No Fresh Fetch Needed!",
              variant : "default"
            });
            return;
        }
    
        // Send the HTTP request
        const result = await sendHttpRequest({ url, method, headers: headersObj, body });
        // Update response or error state based on result
    // Update this part in your handleRequestSubmit function
    // Update response or error state based on result
        if (result.success) {
          cache[cacheKey] = {
            status: result.status!,
            statusText: result.statusText!,
            headers: result.headers!,
            data: result.data,
            responseTime: result.responseTime,
            responseSize: result.responseSize,
        };
        setResponse(cache[cacheKey]);
          // setResponse({
          //   status: result.status!,        
          //   statusText: result.statusText!, 
          //   headers: result.headers!,       
          //   data: result.data,              
          //   responseTime : result.responseTime,
          //   responseSize : result.responseSize,
          // });
          const sanitizedHtml = DOMPurify.sanitize(result.data);
          setSanitizedHtml(sanitizedHtml)
        } else {
          setError(result.error!); // Display error message
        }
      };

  

  return (
    <>
    <div className=' flex items-center justify-center'>
        <div className='mt-4'>
        <h1 className="text-4xl font-bold text-blue-700 mb-4 animate-pulse">HTTP Protocol</h1>
        </div>
    </div>

    <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-6 w-[90%] mx-auto my-8">
  
  {/* Left Section */}
  <section className='bg-muted/50 border-2 rounded-2xl dark:border-slate-50 border-slate-500 w-full md:w-1/2'>
  <div className="py-6 px-10">
            <div className="flex flex-col justify-center space-y-4">
              <h2 className="text-xl font-semibold mb-2">HTTP Request :</h2>

              {/* URL Input */}
              <Label>Enter HTTP URL:</Label>
              <Input type="text" value={url} onChange={handleUrlChange} className="bg-white" placeholder="https://example.com" />

              <Label>Select HTTP Version:</Label>
                <Select onValueChange={handleVersionChange} defaultValue={version}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Versions</SelectLabel>
                      {httpVersions.map((versionOption) => (
                        <SelectItem key={versionOption} value={versionOption}>
                          {versionOption}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
              {/* HTTP Method Selection */}
              <Label>Select HTTP Method:</Label>
              <Select onValueChange={handleMethodChange} defaultValue={method}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Methods</SelectLabel>
                    {httpMethods[version].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Query Parameters */}
              <Label>Query Parameters:</Label>
              {queryParams.map((param, index) => (
                <div key={index} className="flex space-x-4 mb-2">
                  <Input type="text" value={param.key} onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)} placeholder="Key" className="bg-white" />
                  <Input type="text" value={param.value} onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)} placeholder="Value" className="bg-white" />
                  <Button className='bg-red-500 text-white' onClick={() => removeQueryParamRow(index)} >remove</Button>
                </div>
              ))}
              <Button className='w-44' variant={'ghost'} onClick={addQueryParamRow}>+ Add Query Parameter</Button>
              {fullUrl != '' && (
                <>
              <Label>How the url with Query Parameters will look like : </Label>
              <p className='text-blue-500'>{fullUrl}</p>
              </>
               )}
              {/* Headers */}
              <Label>Headers:</Label>
              {headers.map((header, index) => (
                <div key={index} className="flex space-x-4 mb-2">
                  <Input type="text" value={header.key} onChange={(e) => handleHeaderChange(index, 'key', e.target.value)} placeholder="Key" className="bg-white" />
                  <Input type="text" value={header.value} onChange={(e) => handleHeaderChange(index, 'value', e.target.value)} placeholder="Value" className="bg-white" />
                  <Button className='bg-red-500 text-white' onClick={() => removeHeaderRow(index)}>remove</Button>
                </div>
              ))}
              <Button className='w-32' variant={'ghost'} onClick={addHeaderRow}>+ Add Header</Button>

              {/* Body */}
              {(method === 'POST' || method === 'PUT') && (
                <>
              <Label>Body:</Label>
              <textarea
                rows={5}
                value={body}
                onChange={handleBodyChange}
                className="mt-1 p-2 border rounded w-full"
                placeholder="Enter JSON body (for POST/PUT)"
              />
              </>
            )}
            </div>

            <div className="space-x-4 mt-4">
              <Button disabled={url === ''} onClick={handleButtonSubmit}>Send Request</Button>
              <Button onClick={clearForm} variant="outline">Clear</Button>
            </div>

          </div>
  </section>

  {/* Right Section */}
  <section className='bg-muted/50 border-2 rounded-2xl dark:border-slate-50 border-slate-500 w-full md:w-1/2'>
  <div className="py-6 px-10">
    <div className="flex flex-col justify-center space-y-4">
      <h2 className="text-xl font-semibold mb-2">HTTP Response :</h2>


      {!response && !error && (
      <p className='animate-pulse'>No request is sent yet !</p>
      )}


      {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            <h2 className="font-semibold">Error:</h2>
            <pre>{error}</pre>
          </div>
        )}
      
      {response && (
        <>

    
          <p>Code status :</p> 
          <Badge className={`w-10 ${getBadgeColor(response.status)}`}>{response.status}</Badge>

          <p>Response time :</p>
          <Badge className={`w-16`}>{response.responseTime} ms</Badge>

          <p>Response size  :</p> 
          <Badge className={`w-24`}>{response.responseSize} bytes</Badge>

          <Label>Headers :</Label>
            <div>
              <div className="p-2 bg-green-100 border rounded">
                <pre>
                  {Object.entries(response.headers!).map(
                    ([key, value]) => `${key}: ${value}`
                  ).join('\n')}
                </pre>
              </div>
            </div>

            <Tabs defaultValue="pretty" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pretty">Pretty View</TabsTrigger>
        <TabsTrigger value="raw">Raw View</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="pretty">
      <div className="border rounded">
      <ScrollArea className="h-96 w-full ">
        <pre className="bg-gray-800 text-white p-4 rounded">
       {pretty(JSON.stringify(response.data, null, 2))}
        </pre>
        </ScrollArea>
      </div>

      </TabsContent>
      <TabsContent value="raw">
      <div>
            <div className="p-2 bg-gray-800 border text-white rounded">
              <ScrollArea className="h-72 w-full ">
              {typeof response.data === 'object' ? (
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              ) : (
                <pre>{response.data}</pre>
              )}
              </ScrollArea>
            </div>
      </div>
      </TabsContent>

      <TabsContent value="preview">
      <div>
              <div className="p-2 bg-gray-50 border rounded">
                {/* Render HTML safely using dangerouslySetInnerHTML */}
                {/* <div dangerouslySetInnerHTML={{ __html: response.data }} /> */}
                <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

              </div>
      </div>
      </TabsContent>
    </Tabs>



        </>
      )}
    </div>
  </div>
</section>


</div>



    </>
  )
}

export default Page
