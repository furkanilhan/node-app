import * as http from 'http';
import { ROUTE_HANDLERS, CONTENT_TYPE_JSON } from './constants.js';

export const handleRequest = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  const method = req.method || '';
  const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  let matchedRoute = `${method}:${pathname}`;

  // Handle DELETE and GET with dynamic parameters
  if (method === 'DELETE' && pathname.startsWith('/delete/')) {
    const fileName = pathname.substring('/delete/'.length);
    matchedRoute = 'DELETE:/delete';
    ROUTE_HANDLERS[matchedRoute](req, res, { fileName });
  } else if (method === 'GET' && pathname.startsWith('/get/')) {
    const fileName = pathname.substring('/get/'.length);
    matchedRoute = 'GET:/get';
    ROUTE_HANDLERS[matchedRoute](req, res, { fileName });
  } else if (ROUTE_HANDLERS[matchedRoute]) {
    ROUTE_HANDLERS[matchedRoute](req, res);
  } else {
    res.writeHead(404, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
};
