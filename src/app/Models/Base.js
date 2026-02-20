import { db } from "../Lib/turso";
import beforeAdd from "../utils/sql-saftey-checks/beforeAdd";
import beforeGetById from "../utils/sql-saftey-checks/beforeGetById";
import beforeUpdate from "../utils/sql-saftey-checks/beforeUpdate";

export class BaseModel {
    constructor(tableName, schema, allowedColumns) {
        this.tableName = tableName;
        this.schema = schema;
        this.allowedColumns = allowedColumns;
    }

    async createTable() {
        try {
            return await db.execute(this.schema);
        } catch (error) {
            console.error(`error creating ${this.tableName} : ${error}`);
            throw error;
        }
    }

    async insert(payload) {
        try {
            const filter = beforeAdd(payload, this.allowedColumns);

            const result = await db.execute(
                `INSERT OR IGNORE INTO ${this.tableName} (${filter.columnsClause}) 
                 VALUES (${filter.placeholders}) RETURNING id`,
                filter.values
            );

            // Handle insert ignored (duplicate) case
            if (result.rowsAffected === 0) {
                return {
                    ok: true,
                    inserted: false,
                    rowsAffected: 0,
                    returnId: null,
                    message: "Insert ignored (already exists)"
                };
            }

            return {
                ok: true,
                inserted: true,
                rowsAffected: result.rowsAffected,
                returnId: result.rows[0].id
            };
        } catch (error) {
            console.error(`Error adding to ${this.tableName}:`, error);
            return { ok: false, inserted: false, rowsAffected: 0, message: error.message };
        }
    }

    async findById(id, columnsNeeded) {
        try {
            const filter = beforeGetById(columnsNeeded, this.allowedColumns);
            const result = await db.execute(`SELECT ${filter.cols} FROM ${this.tableName} WHERE id = ?`, [id]);

            if (!result.rows[0]) return { ok: false, message: `${this.tableName} not found` };

            return { ok: true, message: 'Record found', data: result.rows[0] };

        } catch (error) {
            console.error(`Error fetching ${this.tableName} by id:`, error);
            return { ok: false, message: 'Error fetching record' };
        }
    }

    async update(payload) {
        try {
            const filter = beforeUpdate(payload, this.allowedColumns);

            const result = await db.execute(
                `UPDATE ${this.tableName} SET ${filter.setClause} WHERE ${filter.whereClause}`,
                filter.values
            );
            if (result.rowsAffected === 0) return { ok: false, message: 'No rows updated' };

            return { ok: true, message: 'Rows updated successfully', rowsAffected: result.rowsAffected };

        } catch (error) {
            console.error(`Error updating ${this.tableName}:`, error);
            return { ok: false, message: error.message };
        }
    }

    async deleteById(id) {
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) throw new Error('Invalid id');
        try {
            const result = await db.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [numericId]);
            if (result.rowsAffected === 0) return { ok: false, deleted: false, message: 'No record deleted' };
            return { ok: true, deleted: true, rowsAffected: result.rowsAffected };
        } catch (error) {
            console.error(`Error deleting from ${this.tableName}:`, error);
            return { ok: false, deleted: false, message: error.message };
        }
    }
}