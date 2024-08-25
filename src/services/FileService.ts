import pool from '../db.js';

export const fileService = {
  async saveFileRecord(filename: string, filepath: string, userId: number) {
    const query = 'INSERT INTO files (filename, filepath, user_id) VALUES ($1, $2, $3)';
    await pool.query(query, [filename, filepath, userId]);
  },

  async getUserFiles(userId: number) {
    const query = 'SELECT * FROM files WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async getFileById(fileId: number, userId: number) {
    const query = 'SELECT * FROM files WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [fileId, userId]);
    return result.rows[0];
  },

  async getFileByName(fileName: string, userId: number) {
    const query = 'SELECT * FROM files WHERE filename = $1 AND user_id = $2';
    const result = await pool.query(query, [fileName, userId]);
    return result.rows[0];
  },

  async deleteFileRecord(fileId: number) {
    const query = 'DELETE FROM files WHERE id = $1';
    await pool.query(query, [fileId]);
  }
};
