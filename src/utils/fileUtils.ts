import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import mime from 'mime';
import { fileService } from './../services/FileService.js';
import { HTTP_STATUS, CONTENT_TYPE_JSON } from './../constants.js';
import { getCurrentDirectory, handleError } from './utils.js';

const __dirname = getCurrentDirectory();
const UPLOAD_DIR = path.join(__dirname, 'uploads');

/**
 * Validates and retrieves a file record by filename and userId.
 * If the file does not exist, it sends a 404 response.
 */
export const validateAndGetFile = async (fileName: string, userId: number, res: http.ServerResponse) => {
  const file = await fileService.getFileByName(fileName, userId);
  if (!file) {
    sendResponse(res, HTTP_STATUS.NOT_FOUND, { error: 'File not found' });
    return null;
  }
  return file;
};

/**
 * Streams a file to the client.
 * Validates the file existence and streams it using fs.createReadStream.
 */
export const streamFile = async (fileName: string, res: http.ServerResponse, userId: number) => {
  const file = await validateAndGetFile(fileName, userId, res);
  if (!file) return;

  const filePath = path.join(UPLOAD_DIR, file.filename);
  const contentType = mime.getType(filePath) || 'application/octet-stream';

  res.writeHead(HTTP_STATUS.OK, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
};

/**
 * Deletes a file both from the server and the database.
 */
export const deleteFile = async (fileName: string, res: http.ServerResponse, userId: number) => {
  const file = await validateAndGetFile(fileName, userId, res);
  if (!file) return;

  try{
    const filePath = path.join(UPLOAD_DIR, file.filename);
    await fs.promises.unlink(filePath);
    await fileService.deleteFileRecord(file.id);
    sendResponse(res, HTTP_STATUS.OK, { message: 'File deleted successfully' });
  } catch(error) {
    sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: 'Internal server error' });
    return undefined;
  }
};

/**
 * Uploads a JSON file.
 * Parses the buffer to JSON, saves it to the file system and records it in the database.
 */
export const uploadJson = async (buffer: Buffer, res: http.ServerResponse, userId: number) => {
  try {
    const json = JSON.parse(buffer.toString());
    const fileName = `upload_${Date.now()}.json`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.promises.writeFile(filePath, JSON.stringify(json, null, 2));
    await fileService.saveFileRecord(fileName, `uploads/${fileName}`, userId);

    const keyTypes = Object.keys(json).map(key => ({
      key,
      type: getValueType(json[key])
    }));

    sendResponse(res, HTTP_STATUS.OK, {
      fileName,
      type: 'json',
      keys: keyTypes,
      contentType: 'application/json'
    });

    return fileName;
  } catch (error) {
    sendResponse(res, HTTP_STATUS.BAD_REQUEST, { error: 'Invalid JSON' });
    return undefined;
  }
};

/**
 * Uploads an image file.
 * Writes the buffer to the file system and records it in the database.
 */
export const uploadImage = (buffer: Buffer, contentType:string, res: http.ServerResponse, userId: number): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    const fileName = `upload_${Date.now()}.${mime.getExtension(contentType)}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const fileStream = fs.createWriteStream(filePath);

    fileStream.write(buffer);
    fileStream.end();

    fileStream.on('close', async () => {
      await fileService.saveFileRecord(fileName, `uploads/${fileName}`, userId);

      sendResponse(res, HTTP_STATUS.OK, {
        fileName,
        type: mime.getExtension(contentType),
        contentType
      });

      resolve(fileName);
    });

    fileStream.on('error', error => {
      handleError(error, res);
      reject(undefined);
    });
  });
};

/**
 * Sends a JSON response to the client with the specified status code and data.
 */
export const sendResponse = (res: http.ServerResponse, statusCode: number, data: any): void => {
  res.writeHead(statusCode, CONTENT_TYPE_JSON);
  res.end(JSON.stringify(data));
};

/**
 * Determines the type of a given value for JSON keys.
 */
const getValueType = (value: any): string => {
  return Array.isArray(value)
    ? `array <${Math.min(value.length, 10)} items>`
    : typeof value === 'object' && value !== null
    ? `object <${Object.keys(value).length} key-value pairs>`
    : typeof value;
};
