import * as http from 'http';
import { routeMap } from './constants.js'; 

export const handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const url = req.url || '';
  const method = req.method || '';
  const routeKey = `${method} ${url}`;

  // Call the relevant controller function according to the route
  const handler = routeMap.get(routeKey);

  if (handler) {
    // Call if there is a matching route
    handler(req, res); 
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
};
