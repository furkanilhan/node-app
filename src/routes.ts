import * as http from 'http';
import { UploadController } from './controllers/UploadController.js';
import { FileController } from './controllers/FileController.js';

const uploadController = new UploadController();
const fileController = new FileController();

export const handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const url = req.url || '';

  if (url === '/upload') {
    uploadController.handleRequest(req, res);
  } else {
    fileController.handleRequest(req, res);
  }
};
