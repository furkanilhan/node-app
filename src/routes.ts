import * as http from 'http';
import { AuthController } from './controllers/AuthController.js';
import { FileController } from './controllers/FileController.js';

// Controller instances
const authController = new AuthController();
const fileController = new FileController();

export const handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const method = req.method || '';
  const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Auth routes
  if (method === 'POST' && pathname === '/register') {
    authController.handleRequest(req, res);
  } else if (method === 'POST' && pathname === '/login') {
    authController.handleRequest(req, res);
  }
  // File routes
  else if (method === 'POST' && pathname === '/upload') {
    fileController.handleUpload(req, res);
  }
  else if (method === 'DELETE' && pathname.startsWith('/delete/')) {
    const fileName = pathname.substring('/delete/'.length);
    fileController.handleDelete(req, res, { fileName });
  } else if (method === 'GET' && pathname === '/list') {
    fileController.handleRequest(req, res);
  } else if (method === 'GET' && pathname.startsWith('/get/')) {
    const fileName = pathname.substring('/get/'.length);
    fileController.handleGetFile(req, res, { fileName });
  }
  // Route not found
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
};
