import { User } from '../models/User.js';
import pool from '../db.js';

export class UserService {
  async createUser(username: string, password: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
    } finally {
      client.release();
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

}

export const userService = new UserService();