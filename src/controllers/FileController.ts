import * as http from 'http';
import { BaseController } from './BaseController.js';
import { fileService } from './../services/FileService.js';
import { parseRequestBody } from '../utils/utils.js';
import {
  deleteFile,
  streamFile,
  uploadJson,
  uploadImage,
  sendResponse,
} from './../utils/fileUtils.js'; 
import { HTTP_STATUS } from './../constants.js';

export class FileController extends BaseController {
  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const userId = req.session?.userId;

    if (!this.isUserAuthenticated(req, res, userId)) {
      return;
    }

    const files = await fileService.getUserFiles(userId!);
    sendResponse(res, HTTP_STATUS.OK, files);
  }

  async handleDelete(req: http.IncomingMessage, res: http.ServerResponse, params: { fileName: string }) {
    const userId = req.session?.userId;

    if (!this.isUserAuthenticated(req, res, userId)) {
      return;
    }

    const fileName = params.fileName;
    await deleteFile(fileName, res, userId!);
  }

  async handleGetFile(req: http.IncomingMessage, res: http.ServerResponse, params: { fileName: string }) {
    const userId = req.session?.userId;

    if (!this.isUserAuthenticated(req, res, userId)) {
      return;
    }

    const fileName = params.fileName;
    await streamFile(fileName, res, userId!);
  }

  async handleUpload(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const userId = req.session?.userId;

    if (!this.isUserAuthenticated(req, res, userId)) {
      return;
    }

    parseRequestBody(req, async (buffer, contentType) => {
      try {
        if (contentType?.startsWith('application/json')) {
          await uploadJson(buffer, res, userId!);
        } else if (contentType?.startsWith('image/png') || contentType?.startsWith('image/jpeg')) {
          await uploadImage(buffer, contentType, res, userId!);
        } else {
          sendResponse(res, HTTP_STATUS.BAD_REQUEST, { error: 'Unsupported Content-Type' });
        }
      } catch (error) {
        this.handleInternalError(res, 'Upload failed');
      }
    });
  }

  private isUserAuthenticated(req: http.IncomingMessage, res: http.ServerResponse, userId: number | undefined): userId is number {
    if (!userId) {
      sendResponse(res, HTTP_STATUS.UNAUTHORIZED, { error: 'Unauthorized access' });
      return false;
    }
    return true;
  }

  private handleInternalError(res: http.ServerResponse, message: string) {
    if (!res.headersSent) {
      sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: message });
    }
  }
}
