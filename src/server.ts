import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { fileURLToPath } from 'url';
import mime from 'mime';

const PORT_HTTP = 80;
const PORT_HTTPS = 443;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, 'uploads');

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt'))
};

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  if (req.method === 'POST' && pathname === '/upload') {
    let body: Buffer[] = [];
    req.on('data', chunk => {
      body.push(chunk);
      console.log('Received chunk');
    });
    req.on('end', () => {
      const buffer = Buffer.concat(body);
      const contentType = req.headers['content-type'];

      if (contentType && contentType.startsWith('application/json')) {
        handleJsonUpload(buffer, res);
      } else if (contentType && (contentType.startsWith('image/png') || contentType.startsWith('image/jpeg'))) {
        handleImageUpload(req, contentType, res);
      } else {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Unsupported Content-Type'}));
      }
    });
  } else if (req.method === 'GET') {
    if (pathname === '/list') {
      handleListFiles(res);
    } else if (pathname.startsWith('/get')) {
      handleGetFile(pathname, res);
    }
  } else if (req.method === 'DELETE' && pathname.startsWith('/delete')) {
    handleDeleteFile(pathname, res);
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Not Found'}));
  }
};

const handleJsonUpload = (buffer: Buffer, res: http.ServerResponse) => {
  try {
    const json = JSON.parse(buffer.toString());
    const fileName = `upload_${Date.now()}.json`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    const keyTypes = Object.keys(json).map(key => {
      const value = json[key];
      const type = Array.isArray(value)
        ? `array <${Math.min(value.length, 10)} items>`
        : typeof value === 'object' && value !== null
        ? `object <${Object.keys(value).length} key-value pairs>`
        : typeof value;

      return {
        key,
        type
      };
    });

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      fileName,
      type: 'json',
      keys: keyTypes,
      contentType: 'application/json'
    }));
  } catch (error) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Invalid JSON'}));
  }
};

const handleImageUpload = (req: http.IncomingMessage, contentType: string, res: http.ServerResponse) => {
  const fileName = `upload_${Date.now()}.${mime.getExtension(contentType)}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const fileStream = fs.createWriteStream(filePath);

  req.pipe(fileStream);

  fileStream.on('close', () => {
    console.log('File write completed');
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      fileName,
      type: mime.getExtension(contentType),
      contentType
    }));
  });

  req.on('end', () => {
    console.log('Request end');
  });

  req.on('error', (error) => {
    console.error('Error during request:', error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Error during file upload'}));
  });

  fileStream.on('error', (error) => {
    console.error('Error during file write:', error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Error during file write'}));
  });
};

const handleListFiles = (res: http.ServerResponse) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(files));
};

const handleGetFile = (pathname: string, res: http.ServerResponse) => {
  const fileName = pathname.split('/').pop() || '';
  const filePath = path.join(UPLOAD_DIR, fileName);

  if (fs.existsSync(filePath)) {
    const contentType = mime.getType(filePath) || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': contentType});
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'File not found'}));
  }
};

const handleDeleteFile = (pathname: string, res: http.ServerResponse) => {
  const fileName = pathname.split('/').pop() || '';
  const filePath = path.join(UPLOAD_DIR, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: 'File deleted'}));
  } else {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'File not found'}));
  }
};

const httpServer = http.createServer((req, res) => {
  if (req.headers['x-forwarded-proto'] === 'https') {
    handleRequest(req, res);
  } else {
    res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`});
    res.end();
  }
});

const httpsServer = https.createServer(sslOptions, handleRequest);

httpServer.listen(PORT_HTTP, () => {
  console.log(`HTTP Server listening on port ${PORT_HTTP}`);
});

httpsServer.listen(PORT_HTTPS, () => {
  console.log(`HTTPS Server listening on port ${PORT_HTTPS}`);
});
