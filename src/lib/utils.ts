import { NextApiRequest } from 'next';

export function getClientIP(req: NextApiRequest) {
  return req.headers['x-forwarded-for']?.toString() || 
         req.socket.remoteAddress || 
         'unknown';
}

export function sanitizeInput(text: string): string {
  return text.slice(0, 2000);
}