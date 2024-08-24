import * as http from 'http';
import { BaseController } from './BaseController.js';
import { handleListFiles, handleGetFile, handleDeleteFile } from './../fileHandlers.js';
import { ROUTES } from './../constants.js';

export class FileController extends BaseController {
  handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '';

    if (url === ROUTES.LIST) {
      handleListFiles(res);
    } else if (url.startsWith(ROUTES.GET)) {
      handleGetFile(url, res);
    } else if (req.method === 'DELETE' && url.startsWith(ROUTES.DELETE)) {
      handleDeleteFile(url, res);
    } else {
      this.handleNotFound(res);
    }
  }
}
