import { BaseModel } from "./Base";

export class PostModel extends BaseModel {
    static tableName = 'posts';
    static schema = `
    CREATE TABLE IF NOT EXISTS posts(
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        title TEXT,
        excerpt TEXT,
        slug TEXT,
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );`;

    static allowedColumns = ['user_id', 'title', 'excerpt', 'slug', 'content'];

    constructor() {
        super(PostModel.tableName, PostModel.schema, PostModel.allowedColumns);
    };
};