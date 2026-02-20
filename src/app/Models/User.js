import { BaseModel } from "./Base";
import { db } from "../Lib/turso"; // Added missing import

export class UserModel extends BaseModel {
    static tableName = 'users';
    static allowedColumns = ['username', 'password', 'role'];
    static schema = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Guest',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`;

    static uniqueIndex = `
    CREATE UNIQUE INDEX IF NOT EXISTS one_admin_idx
        ON users(role)
        WHERE role = 'admin' COLLATE NOCASE`;

    constructor() {
        super(UserModel.tableName, UserModel.schema, UserModel.allowedColumns);
    };

    static async createUniqueIndex() {
        try {
            return await db.execute(this.uniqueIndex);
        } catch (error) {
            console.error("Error creating unique index for users table:", error);
            throw error;
        }
    }
};