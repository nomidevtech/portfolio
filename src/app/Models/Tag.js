import { BaseModel } from "./Base";

export class TagModel extends BaseModel {
    static tableName = 'tags';
    static schema = `
      CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL      
      )
   `;

    static allowedColumns = ['name'];

    constructor() {
        super(TagModel.tableName, TagModel.schema, TagModel.allowedColumns);
    };
};