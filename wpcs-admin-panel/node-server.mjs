/**
 * Node.js HTTP adapter for TanStack Start (Cloudflare Workers format)
 * This wraps the Cloudflare-style `fetch` export into a proper Node.js HTTP server.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || process.env.NITRO_PORT || 3002;

// Import the built server entry
const { default: app } = await import('./dist/server/server.js');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    // Try to serve static files from dist/client first
    const clientDir = join(__dirname, 'dist', 'client');
    const filePath = join(clientDir, url.pathname);
    
    if (url.pathname !== '/' && existsSync(filePath)) {
      const ext = extname(filePath);
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      const content = readFileSync(filePath);
      
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': url.pathname.includes('/assets/') 
          ? 'public, max-age=31536000, immutable' 
          : 'public, max-age=3600',
      });
      res.end(content);
      return;
    }

    // Convert Node.js request to Fetch API Request
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }

    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? await new Promise((resolve) => {
          const chunks = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks)));
        })
      : undefined;

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    // Call the TanStack Start handler
    const response = await app.fetch(request);

    // Convert Fetch API Response back to Node.js response
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    
    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      await pump();
    } else {
      const text = await response.text();
      res.end(text);
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Admin panel running on http://0.0.0.0:${PORT}`);
});
