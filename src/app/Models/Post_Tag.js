import { BaseModel } from "./Base";

export class Post_Tag_Model extends BaseModel {
    static tableName = 'post_tags';
    static schema = `
      CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY( post_id, tag_id),
      FOREIGN KEY(post_id) REFERENCES posts(id),
      FOREIGN KEY(tag_id) REFERENCES tags(id)
      )
      `;

    static allowedColumns = ['post_id', 'tag_id'];

    constructor() {
        super(Post_Tag_Model.tableName, Post_Tag_Model.schema, Post_Tag_Model.allowedColumns);
    };
};