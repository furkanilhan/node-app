import * as http from 'http';
import * as url from 'url';
import { handleJsonUpload, handleImageUpload, handleListFiles, handleGetFile, handleDeleteFile } from './fileHandlers.js';
import { parseRequestBody } from './utils.js';
import { CONTENT_TYPE_JSON, HTTP_STATUS } from './constants.js';

const handlePostRequest = (req: http.IncomingMessage, res: http.ServerResponse, pathname: string) => {
  if (pathname === '/upload') {
    parseRequestBody(req, (buffer, contentType) => {
      if (contentType?.startsWith('application/json')) {
        handleJsonUpload(buffer, res);
      } else if (contentType?.startsWith('image/png') || contentType?.startsWith('image/jpeg')) {
        handleImageUpload(req, contentType, res);
      } else {
        res.writeHead(HTTP_STATUS.BAD_REQUEST, CONTENT_TYPE_JSON);
        res.end(JSON.stringify({ error: 'Unsupported Content-Type' }));
      }
    });
  } else {
    res.writeHead(HTTP_STATUS.NOT_FOUND, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
};

export const handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  if (req.method === 'POST') {
    handlePostRequest(req, res, pathname);
  } else if (req.method === 'GET') {
    if (pathname === '/list') {
      handleListFiles(res);
    } else if (pathname.startsWith('/get')) {
      handleGetFile(pathname, res);
    }
  } else if (req.method === 'DELETE' && pathname.startsWith('/delete')) {
    handleDeleteFile(pathname, res);
  } else {
    res.writeHead(HTTP_STATUS.NOT_FOUND, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
};
