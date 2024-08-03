import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import mime from 'mime';
import { getCurrentDirectory, handleError } from './utils.js';
import { CONTENT_TYPE_JSON, HTTP_STATUS } from './constants.js';

const __dirname = getCurrentDirectory();
const UPLOAD_DIR = path.join(__dirname, 'uploads');

export const handleJsonUpload = async (buffer: Buffer, res: http.ServerResponse) => {
  try {
    const json = JSON.parse(buffer.toString());
    const fileName = `upload_${Date.now()}.json`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.promises.writeFile(filePath, JSON.stringify(json, null, 2));

    const keyTypes = Object.keys(json).map(key => {
      const value = json[key];
      const type = Array.isArray(value)
        ? `array <${Math.min(value.length, 10)} items>`
        : typeof value === 'object' && value !== null
        ? `object <${Object.keys(value).length} key-value pairs>`
        : typeof value;

      return { key, type };
    });

    res.writeHead(HTTP_STATUS.OK, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({
      fileName,
      type: 'json',
      keys: keyTypes,
      contentType: 'application/json'
    }));
  } catch (error) {
    res.writeHead(HTTP_STATUS.BAD_REQUEST, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
};

export const handleImageUpload = (req: http.IncomingMessage, contentType: string, res: http.ServerResponse) => {
  const fileName = `upload_${Date.now()}.${mime.getExtension(contentType)}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const fileStream = fs.createWriteStream(filePath);

  req.pipe(fileStream);

  fileStream.on('close', () => {
    res.writeHead(HTTP_STATUS.OK, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({
      fileName,
      type: mime.getExtension(contentType),
      contentType
    }));
  });

  req.on('error', error => handleError(error, res));
  fileStream.on('error', error => handleError(error, res));
};

export const handleListFiles = async (res: http.ServerResponse) => {
  try {
    const files = await fs.promises.readdir(UPLOAD_DIR);
    res.writeHead(HTTP_STATUS.OK, CONTENT_TYPE_JSON);
    res.end(JSON.stringify(files));
  } catch (error) {
    handleError(error, res);
  }
};

export const handleGetFile = async (pathname: string, res: http.ServerResponse) => {
  const fileName = pathname.split('/').pop() || '';
  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    if (await fs.promises.stat(filePath)) {
      const contentType = mime.getType(filePath) || 'application/octet-stream';
      res.writeHead(HTTP_STATUS.OK, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    res.writeHead(HTTP_STATUS.NOT_FOUND, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: 'File not found' }));
  }
};

export const handleDeleteFile = async (pathname: string, res: http.ServerResponse) => {
  const fileName = pathname.split('/').pop() || '';
  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    await fs.promises.unlink(filePath);
    res.writeHead(HTTP_STATUS.OK, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ message: 'File deleted' }));
  } catch (error) {
    res.writeHead(HTTP_STATUS.NOT_FOUND, CONTENT_TYPE_JSON);
    res.end(JSON.stringify({ error: 'File not found' }));
  }
};
