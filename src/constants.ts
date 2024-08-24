import * as path from 'path';
import { getCurrentDirectory } from './utils.js';

const __dirname = getCurrentDirectory();

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
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ROUTES = {
  UPLOAD: '/upload',
  LIST: '/list',
  GET: '/get',
  DELETE: '/delete'
};
