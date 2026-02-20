export default function beforeGetById(columnsNeeded, allowedColumns) {
    let cols = '*';

    if (Array.isArray(columnsNeeded) && columnsNeeded[0] !== '*') {
        const safeCols = columnsNeeded.filter(c => allowedColumns.includes(c));

        if (safeCols.length === 0) throw new Error('No valid columns selected');

        cols = safeCols.join(',');
    };

    return { cols };
}