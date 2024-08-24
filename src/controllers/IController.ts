import * as http from 'http';

export interface IController {
  handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void;
}
