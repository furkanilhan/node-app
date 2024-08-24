import * as http from 'http';
import { BaseController } from './BaseController.js';
import { parseRequestBody } from './../utils.js';
import { handleJsonUpload, handleImageUpload } from './../fileHandlers.js';
import { HTTP_STATUS } from './../constants.js';

export class UploadController extends BaseController {
  handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    parseRequestBody(req, (buffer, contentType) => {
      if (contentType?.startsWith('application/json')) {
        handleJsonUpload(buffer, res);
      } else if (contentType?.startsWith('image/png') || contentType?.startsWith('image/jpeg')) {
        handleImageUpload(req, contentType, res);
      } else {
        this.sendResponse(res, HTTP_STATUS.BAD_REQUEST, { error: 'Unsupported Content-Type' });
      }
    });
  }
}
