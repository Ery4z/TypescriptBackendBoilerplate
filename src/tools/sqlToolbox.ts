import sql from 'mssql';



export async function ensureTableExists(pool: sql.ConnectionPool, tableMapping: TableMapping) {
    // Extract tableName from the mapping
    const tableName = tableMapping.tableName;

    // Check if the table exists
    const checkQuery = `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'${tableName}') SELECT 1 AS doesNotExist`;

    try {
        const result = await pool.request().query(checkQuery);

        if (result.recordset.length > 0 && result.recordset[0].doesNotExist) {
            // Table does not exist, so create it
            const createTableQuery = generateCreateTableQuery(tableMapping);
            await pool.request().query(createTableQuery);
            console.log(`Table '${tableName}' created successfully.`);
        } else {
            console.log(`Table '${tableName}' already exists.`);
        }
    } catch (err) {
        console.error('Error in ensureTableExists:', err);
        throw err;
    }
}


export function generateCreateTableQuery(mapping: TableMapping): string {
    const fields = Object.entries(mapping.columns)
        .map(([key, sqlType]) => `${key} ${sqlType}`)
        .join(',\n    ');

    const primaryKey = mapping.primaryKey ? `, PRIMARY KEY (${mapping.primaryKey})` : '';
    const foreignKeys = mapping.foreignKeys 
        ? Object.entries(mapping.foreignKeys).map(([column, reference]) => `, FOREIGN KEY (${column}) REFERENCES ${reference}`)
        .join('') : '';

    const constraints = mapping.constraints?.join(',\n    ') || '';

    return `CREATE TABLE ${mapping.tableName} (\n    ${fields}${primaryKey}${foreignKeys}${constraints ? ',\n    ' + constraints : ''}\n);`;
}

export interface TableMapping {
    tableName: string;
    columns: { [columnName: string]: string };
    primaryKey: string;
    foreignKeys: { [columnName: string]: string };
    setForeignKey: (columnName:string, tableReference:string, columnReference:string) => void;
    constraints: string[];
}