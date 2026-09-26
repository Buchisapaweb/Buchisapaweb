import type { Request, Response } from 'express';
import app from '../server.ts';

export default function handler(req: Request, res: Response) {
  // Extract original requested path from Vercel headers if available
  const vercelPath = 
    (req.headers['x-vercel-matched-path'] as string) ||
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-now-route-matches'] as string) ||
    req.url;

  if (vercelPath && vercelPath.startsWith('/api')) {
    req.url = vercelPath;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  
  return app(req, res);
}
