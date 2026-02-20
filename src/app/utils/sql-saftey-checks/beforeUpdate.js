export default function beforeUpdate(payload, allowedColumns) {
    if (!payload.where?.id) throw new Error('missing where condition: id');

    const entries = Object.entries(payload.data || {});
    const safeEntries = entries.filter(([key]) => allowedColumns.includes(key));

    if (safeEntries.length === 0) throw new Error('no allowed columns to update');

    const setClause = safeEntries.map(([key]) => `${key}=?`).join(',');
    const whereClause = 'id = ?';
    const values = safeEntries.map(([_, value]) => value);

    values.push(payload.where.id);

    return { setClause, whereClause, values };
};