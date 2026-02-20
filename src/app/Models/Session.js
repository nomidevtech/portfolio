import { BaseModel } from "./Base";

export class SessionModel extends BaseModel {
    static tableName = 'sessions';
    static schema = `
    CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`;

    static allowedColumns = ['user_id', 'token'];

    constructor() {
        super(SessionModel.tableName, SessionModel.schema, SessionModel.allowedColumns);
    };
};