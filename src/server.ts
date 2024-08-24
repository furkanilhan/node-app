import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { PORTS, SSL_OPTIONS } from './constants.js';
import { handleRequest } from './routes.js';
import { checkUploadDirectory, getCurrentDirectory } from './utils.js';

const __dirname = getCurrentDirectory();

const sslOptions = {
  key: fs.readFileSync(SSL_OPTIONS.keyPath),
  cert: fs.readFileSync(SSL_OPTIONS.certPath)
};

checkUploadDirectory(path.join(__dirname, 'uploads'));

const httpServer = http.createServer((req, res) => {
  if (req.headers['x-forwarded-proto'] === 'https') {
    handleRequest(req, res);
  } else {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  }
});

const httpsServer = https.createServer(sslOptions, (req, res) => {
  console.log(`HTTPS Request received: ${req.method} ${req.url}`);
  handleRequest(req, res);
});

httpServer.listen(PORTS.HTTP, () => {
  console.log(`HTTP Server listening on port ${PORTS.HTTP}`);
});

httpsServer.listen(PORTS.HTTPS, () => {
  console.log(`HTTPS Server listening on port ${PORTS.HTTPS}`);
});