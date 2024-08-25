import * as http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { HTTP_STATUS, SESSION_TIMEOUT, ROUTES } from '../constants.js';

// Storing sessions in server memory
const sessionStore = new Map<string, any>();

// Create new session or retrieve existing session
function getSession(req: http.IncomingMessage, res: http.ServerResponse) {
  const cookie = req.headers.cookie;
  let sessionId: string | undefined;

  if (cookie) {
    const cookies = cookie.split(';').reduce((acc: any, cookie) => {
      const [key, value] = cookie.split('=').map(c => c.trim());
      acc[key] = value;
      return acc;
    }, {});
    sessionId = cookies['sessionId'];
  }

  if (!sessionId || !sessionStore.has(sessionId)) {
    sessionId = uuidv4();
    sessionStore.set(sessionId, { created: Date.now(), data: {} });
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/`);
  }

  const session = sessionStore.get(sessionId);
  return session ? session.data : {};
}

// Middleware that controls sessions
export const sessionMiddleware = (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => {
  const sessionData = getSession(req, res);
  req.session = sessionData;
  const isProtectedRoute = Object.values(ROUTES).includes(req.url || '');

  if (isProtectedRoute && !sessionData.userId) {
    res.writeHead(HTTP_STATUS.UNAUTHORIZED, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized access' }));
  } else {
    next(); // If the session exists or is not a protected route, continue to the next operation
  }
};

// Server cleanup (cleaning up expired sessions)
export function cleanupSessions() {
  const now = Date.now();
  sessionStore.forEach((session, sessionId) => {
    if (now - session.created > SESSION_TIMEOUT) {
      sessionStore.delete(sessionId);
    }
  });
}
