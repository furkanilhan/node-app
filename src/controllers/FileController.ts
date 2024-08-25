import * as http from 'http';
import { BaseController } from './BaseController.js';
import { handleListFiles, handleGetFile, handleDeleteFile } from './../fileHandlers.js';
import { HTTP_STATUS, ROUTES } from './../constants.js';

export class FileController extends BaseController {
  handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '';

    if (req.session && req.session.userId) {
      if (url === ROUTES.LIST && req.method === 'GET') {
        handleListFiles(res);
      } else if (url.startsWith(ROUTES.GET) && req.method === 'GET') {
        handleGetFile(url, res);
      } else if (url.startsWith(ROUTES.DELETE) && req.method === 'DELETE') {
        handleDeleteFile(url, res);
      } else {
        this.handleNotFound(res);
      }
    } else {
      this.sendResponse(res, HTTP_STATUS.UNAUTHORIZED, { error: 'Unauthorized access' });
    }
  }
}
