import { BaseModel } from "./Base";

export class Post_Taxonomy_Model extends BaseModel {
    static tableName = 'post_taxonomies';
    static schema = `
      CREATE TABLE IF NOT EXISTS post_taxonomies (
      post_id INTEGER,
      taxonomy_id INTEGER,
      PRIMARY KEY( post_id, taxonomy_id),
      FOREIGN KEY(post_id) REFERENCES posts(id),
      FOREIGN KEY(taxonomy_id) REFERENCES taxonomies(id)
      )
      `;

    static allowedColumns = ['post_id', 'taxonomy_id'];

    constructor() {
        super(
            Post_Taxonomies_Model.tableName,
            Post_Taxonomies_Model.schema,
            Post_Taxonomies_Model.allowedColumns
        );
    };
};