import { Context } from "@netlify/functions";
import app from "../../backend/hono";

export default async (req: Request, context: Context) => {
  console.log('[Netlify Function] === NEW REQUEST ===');
  console.log('[Netlify Function] Method:', req.method);
  console.log('[Netlify Function] URL:', req.url);
  console.log('[Netlify Function] Headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source, x-trpc-batch',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(req.url);
    const pathname = url.pathname;
    
    console.log('[Netlify Function] Original pathname:', pathname);
    
    let rewrittenPath = pathname;
    if (pathname.startsWith('/.netlify/functions/api')) {
      rewrittenPath = pathname.replace('/.netlify/functions/api', '/api');
    }
    
    console.log('[Netlify Function] Rewritten path:', rewrittenPath);
    console.log('[Netlify Function] Search params:', url.search);
    
    const modifiedUrl = new URL(rewrittenPath + url.search, url.origin);
    const modifiedRequest = new Request(modifiedUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });
    
    console.log('[Netlify Function] Calling Hono app with:', modifiedUrl.toString());
    const response = await app.fetch(modifiedRequest);
    
    console.log('[Netlify Function] Response status:', response.status);
    console.log('[Netlify Function] Response headers:', Object.fromEntries(response.headers.entries()));
    
    const clonedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
    
    clonedResponse.headers.set('Access-Control-Allow-Origin', '*');
    clonedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    clonedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-trpc-source, x-trpc-batch');
    
    return clonedResponse;
  } catch (error) {
    console.error('[Netlify Function] ===  ERROR ===');
    console.error('[Netlify Function] Error:', error);
    console.error('[Netlify Function] Stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        path: new URL(req.url).pathname
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source, x-trpc-batch',
        }
      }
    );
  }
};

export const config = {
  path: "/api/*",
};
