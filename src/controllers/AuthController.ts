import * as http from 'http';
import * as bcrypt from 'bcrypt';
import { BaseController } from './BaseController.js';
import { userService } from '../services/UserService.js';
import { parseRequestBody } from '../utils/utils.js';
import { HTTP_STATUS } from './../constants.js';

export class AuthController extends BaseController {
  handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '';

    if (url === '/register' && req.method === 'POST') {
      this.handleRegister(req, res);
    } else if (url === '/login' && req.method === 'POST') {
      this.handleLogin(req, res);
    } else {
      this.handleNotFound(res);
    }
  }

  private async handleRegister(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      parseRequestBody(req, async (buffer) => {
        const { username, password } = JSON.parse(buffer.toString());

        const existingUser = await userService.findByUsername(username);
        if (existingUser) {
          return this.sendResponse(res, HTTP_STATUS.BAD_REQUEST, {
            error: 'Username already exists',
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userService.createUser(username, hashedPassword);

        this.sendResponse(res, HTTP_STATUS.CREATED, {
          message: 'User registered successfully',
        });
      });
    } catch (error) {
      this.sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        error: 'Internal Server Error',
      });
    }
  }

  private async handleLogin(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      parseRequestBody(req, async (buffer) => {
        const { username, password } = JSON.parse(buffer.toString());

        const user = await userService.findByUsername(username);
        if (!user) {
          return this.sendResponse(res, HTTP_STATUS.NOT_FOUND, {
            error: 'User not found',
          });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return this.sendResponse(res, HTTP_STATUS.UNAUTHORIZED, {
            error: 'Invalid password',
          });
        }

        if (req.session) {
          req.session.userId = user.id;
          this.sendResponse(res, HTTP_STATUS.OK, {
            message: 'Logged in successfully',
          });
        } else {
          this.sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
            error: 'Session not initialized',
          });
        }
      });
    } catch (error) {
      this.sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        error: 'Internal Server Error',
      });
    }
  }
}
