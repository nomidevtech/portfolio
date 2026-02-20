export default function beforeAdd(payload, allowedColumns) {
    const data = payload?.data || {};
    const entries = Object.entries(data).filter(([key]) => allowedColumns.includes(key));

    if (entries.length === 0) throw new Error('No valid data provided for insertion');

    return {
        columnsClause: entries.map(([key]) => key).join(', '),
        placeholders: entries.map(() => '?').join(', '),
        values: entries.map(([_, value]) => value)
    };
}