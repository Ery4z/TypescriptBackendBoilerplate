
// External dependencies
import { PasswordRecovery } from "./passwordRecovery";
import { convertToObjectId, convertObjectIdToString, genericConversion } from "../tools/typeConversion";
import { TableMapping } from "../tools/sqlToolbox";

export const PasswordRecoverySQLServerMapping: TableMapping = {
    tableName: 'PasswordRecoveries',
    schema: 'dbo',
    columns: {
        expirationDate: 'DATETIME',
        userId: 'INT', // Adjust according to your UserId data type
        isUsed: 'BIT',
        _id: 'INT IDENTITY(1,1)' // If using auto-increment in SQL Server
    },
    primaryKey: '_id',
    foreignKeys: {},
    setForeignKey: function (columnName:string, schemaReference:string, tableReference:string, columnReference:string) {
        this.foreignKeys = this.foreignKeys ?? {};
        this.foreignKeys[columnName] = `${schemaReference}.${tableReference}(${columnReference})`;
    },
    constraints: []
};

// Interface for SQL Server version of PasswordRecovery
interface PasswordRecoverySQLServerInterface {
    expirationDate: Date;
    userId: string;
    isUsed: boolean;
    _id: BigInt;
}

export interface PasswordRecoverySQLServer extends PasswordRecoverySQLServerInterface {};

// Class Implementation
export class PasswordRecoverySQLServer implements PasswordRecoverySQLServerInterface {
    constructor(data: PasswordRecoverySQLServerInterface) {
        Object.assign(this, data);
    }
}

export function isKeyOfPasswordRecoverySQLServer(key: string): key is keyof PasswordRecoverySQLServer {
    return key in PasswordRecoverySQLServer.prototype;
}


// Function to load PasswordRecovery from SQL Server format
export function loadPasswordRecoveryFromSQLServer(recoverySQLServer: PasswordRecoverySQLServer | null): PasswordRecovery | null {
    const conversionRules = {
        _id: String // Convert SQL Server BigInt ID to string
    };

    return recoverySQLServer ? genericConversion(recoverySQLServer, conversionRules) : null;
}

// Function to dump PasswordRecovery to SQL Server format
export function dumpPasswordRecoveryToSQLServer(recovery: Partial<PasswordRecovery>): PasswordRecoverySQLServer {
    const conversionRules = {
        _id: parseInt // Convert string ID to SQL Server BigInt
    };

    return genericConversion(recovery, conversionRules);
}
