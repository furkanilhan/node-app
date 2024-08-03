import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { fileURLToPath } from 'url';
import { CONTENT_TYPE_JSON, HTTP_STATUS } from './constants.js';

export const getCurrentDirectory = () => {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
};

export const checkUploadDirectory = (uploadDir: string) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
};

export const handleError = (error: unknown, res: http.ServerResponse) => {
  console.error('Error:', error);
  res.writeHead(HTTP_STATUS.INTERNAL_SERVER_ERROR, CONTENT_TYPE_JSON);

  if (error instanceof Error) {
    res.end(JSON.stringify({ error: error.message }));
  } else {
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};

export const parseRequestBody = (req: http.IncomingMessage, callback: (body: Buffer, contentType: string | undefined) => void) => {
  let body: Buffer[] = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    const buffer = Buffer.concat(body);
    callback(buffer, req.headers['content-type']);
  });
};
