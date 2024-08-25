import * as http from 'http';

interface CustomSession {
  userId?: number;
  [key: string]: any;
}

declare module 'http' {
  interface IncomingMessage {
    session?: CustomSession;
  }
}
