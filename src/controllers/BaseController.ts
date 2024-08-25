import * as http from 'http';
import { HTTP_STATUS, CONTENT_TYPE_JSON } from './../constants.js';
import { IController } from './IController.js';

export abstract class BaseController implements IController {
  abstract handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void;

  protected sendResponse(res: http.ServerResponse, statusCode: number, data: any): void {
    res.writeHead(statusCode, CONTENT_TYPE_JSON);
    res.end(JSON.stringify(data));
  }

  protected handleNotFound(res: http.ServerResponse): void {
    this.sendResponse(res, HTTP_STATUS.NOT_FOUND, { error: 'Not Found' });
  }
}
