import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      console.log('[Hono] Incoming request from origin:', origin || 'no-origin');
      return origin || "*";
    },
    allowHeaders: ["Content-Type", "Authorization", "x-trpc-source", "x-trpc-batch"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use(
  "/api/trpc/*",
  async (c, next) => {
    console.log('[Hono] tRPC request:', c.req.method, c.req.url);
    console.log('[Hono] tRPC path:', c.req.path);
    await next();
  },
  trpcServer({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error('[tRPC] Error on path:', path);
      console.error('[tRPC] Error details:', error);
    },
  })
);

app.get("/", (c) => {
  console.log('[Hono] Root endpoint accessed');
  return c.json({ status: "ok", message: "API is running", timestamp: new Date().toISOString() });
});

app.get("/api", (c) => {
  console.log('[Hono] API endpoint accessed');
  return c.json({ status: "ok", message: "API endpoint", timestamp: new Date().toISOString() });
});

app.get("/api/trpc", (c) => {
  console.log('[Hono] tRPC base endpoint accessed');
  return c.json({ status: "ok", message: "tRPC endpoint - use POST for procedures", timestamp: new Date().toISOString() });
});

app.get("/health", (c) => {
  console.log('[Hono] Health check');
  return c.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.notFound((c) => {
  console.warn('[Hono] Not found:', c.req.path);
  return c.json({ error: "Not Found", path: c.req.path }, 404);
});

app.onError((err, c) => {
  console.error('[Hono] Error:', err);
  return c.json({ 
    error: "Internal Server Error", 
    message: err.message,
    path: c.req.path 
  }, 500);
});

export default app;
