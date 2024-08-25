import * as path from 'path';
import * as http from 'http';
import { getCurrentDirectory } from './utils.js';
import { AuthController } from './controllers/AuthController.js';
import { FileController } from './controllers/FileController.js';
import { UploadController } from './controllers/UploadController.js';

// Controller instances
const authController = new AuthController();
const fileController = new FileController();
const uploadController = new UploadController();

const __dirname = getCurrentDirectory();

// Session duration (milliseconds)
export const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

export const PORTS = {
  HTTP: 80,
  HTTPS: 443
};

export const SSL_OPTIONS = {
  keyPath: path.join(__dirname, 'ssl', 'server.key'),
  certPath: path.join(__dirname, 'ssl', 'server.crt')
};

export const CONTENT_TYPE_JSON = { 'Content-Type': 'application/json' };
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ROUTES = {
  UPLOAD: '/upload',
  LIST: '/list',
  GET: '/get',
  DELETE: '/delete'
};

// Map that maps routes and methods to controller functions
export const routeMap = new Map<string, (req: http.IncomingMessage, res: http.ServerResponse) => void>();

// Auth routes
routeMap.set('POST /register', authController.handleRequest.bind(authController));
routeMap.set('POST /login', authController.handleRequest.bind(authController));

// File routes
routeMap.set('POST /upload', uploadController.handleRequest.bind(uploadController));
routeMap.set('DELETE /delete', fileController.handleRequest.bind(fileController));
routeMap.set('GET /list', fileController.handleRequest.bind(fileController));
routeMap.set('GET /get', fileController.handleRequest.bind(fileController));
