import { BaseModel } from "./Base";

export class TaxonomyModel extends BaseModel {
    static tableName = 'taxonomies';
    static schema = `
      CREATE TABLE IF NOT EXISTS taxonomies (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL      
      )
   `;

    static allowedColumns = ['name'];

    constructor() {
        super(TaxonomyModel.tableName, TaxonomyModel.schema, TaxonomyModel.allowedColumns);
    };
};