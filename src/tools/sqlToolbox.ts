import sql from 'mssql';



export async function ensureTableExists(pool: sql.ConnectionPool, tableMapping: TableMapping) {
    // Extract tableName from the mapping
    const tableName = tableMapping.tableName;

    // Check if the table exists
    const checkQuery = `IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=N'${tableMapping.schema}' AND TABLE_NAME = N'${tableMapping.tableName}') SELECT 0 AS doesNotExist ELSE SELECT 1 AS doesNotExist`;

    try {
        const result = await pool.request().query(checkQuery);

        if (result.recordset.length > 0 && result.recordset[0].doesNotExist) {
            // Table does not exist, so create it
            const createTableQuery = generateCreateTableQuery(tableMapping);
            await pool.request().query(createTableQuery);
            console.log(`Table '${tableMapping.schema}.${tableName}' created successfully.`);
        } else {
            console.log(`Found Table '${tableMapping.schema}.${tableName}'.`);
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

    return `CREATE TABLE ${mapping.schema}.${mapping.tableName} (\n    ${fields}${primaryKey}${foreignKeys}${constraints ? ',\n    ' + constraints : ''}\n);`;
}

export interface TableMapping {
    tableName: string;
    schema: string;
    columns: { [columnName: string]: string };
    primaryKey: string;
    foreignKeys: { [columnName: string]: string };
    setForeignKey: (columnName:string, schemaReference:string, tableReference:string, columnReference:string) => void;
    constraints: string[];
}