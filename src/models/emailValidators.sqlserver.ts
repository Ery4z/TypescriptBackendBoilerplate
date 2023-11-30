// emailValidator.sqlserver.ts

// External dependencies
import { EmailValidator } from "./emailValidators";
import { convertToObjectId, convertObjectIdToString, genericConversion } from "../tools/typeConversion";
import { TableMapping } from "../tools/sqlToolbox";
// SQL Server data type mappings for EmailValidator
export const EmailValidatorSQLServerMapping: TableMapping = {
    tableName: 'EmailValidators',
    columns: {
        email: 'NVARCHAR(255)',
        expirationDate: 'DATETIME',
        userId: 'BIGINT',
        isUsed: 'BIT',
        _id: 'BIGINT'
    },
    primaryKey: '_id',
    foreignKeys: {},
    setForeignKey: function (columnName:string, tableReference:string, columnReference:string) {
        this.foreignKeys = this.foreignKeys ?? {};
        this.foreignKeys[columnName] = `${tableReference}(${columnReference})`;
    },
    constraints: []
};

// Interface for SQL Server version of EmailValidator
interface EmailValidatorSQLServerInterface {
    email: string;
    expirationDate: Date;
    userId: string;
    isUsed: boolean;
    _id: BigInt;
}

export interface EmailValidatorSQLServer extends EmailValidatorSQLServerInterface {};

// Class Implementation
export class EmailValidatorSQLServer implements EmailValidatorSQLServerInterface {
    constructor(data: EmailValidatorSQLServerInterface) {
        Object.assign(this, data);
    }
}

export function isKeyOfEmailValidatorSQLServer(key: string): key is keyof EmailValidatorSQLServer {
    return key in EmailValidatorSQLServer.prototype;
}



// Function to load EmailValidator from SQL Server format
export function loadEmailValidatorFromSQLServer(validatorSQLServer: EmailValidatorSQLServer | null): EmailValidator | null {
    const conversionRules = {
        _id: convertObjectIdToString // Convert SQL Server BigInt ID to string
    };

    return validatorSQLServer ? genericConversion(validatorSQLServer, conversionRules) : null;
}

// Function to dump EmailValidator to SQL Server format
export function dumpEmailValidatorToSQLServer(validator: Partial<EmailValidator>): EmailValidatorSQLServer {
    const conversionRules = {
        _id: convertToObjectId // Convert string ID to SQL Server BigInt
    };

    return genericConversion(validator, conversionRules);
}
