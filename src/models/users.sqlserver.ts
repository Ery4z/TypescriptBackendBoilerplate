// External dependencies
import { User } from "./users";
import { convertArrayToObjectId, convertToObjectId, genericConversion, convertArrayObjectIdToString, convertObjectIdToString } from "../tools/typeConversion";
import { TableMapping } from "../tools/sqlToolbox";


// Used to create automaticaly the table if necessary

export const UserSQLServerMapping: TableMapping = {
    tableName: 'Users',
    schema: 'dbo',
    columns: {
        email: 'NVARCHAR(100)',
        userName: 'NVARCHAR(50)',
        password: 'NVARCHAR(100)',
        salt: 'NVARCHAR(100)',
        avatarURL: 'NVARCHAR(500)',
        planId: 'NVARCHAR(100)',
        stripeSubscriptionId: 'NVARCHAR(100)',
        status: 'NVARCHAR(30)',
        createDate: 'DATETIME',
        lastActivityDate: 'DATETIME',
        firstName: 'NVARCHAR(50)',
        lastName: 'NVARCHAR(50)',
        countryISO: 'NVARCHAR(10)',
        address: 'NVARCHAR(100)',
        city: 'NVARCHAR(100)',
        phone: 'NVARCHAR(20)',
        isAdmin: 'BIT',
        _id: 'INT IDENTITY(1,1)'
    },
    primaryKey: '_id',
    foreignKeys: {},
    setForeignKey: function (columnName:string, schemaReference:string, tableReference:string, columnReference:string) {
        this.foreignKeys = this.foreignKeys ?? {};
        this.foreignKeys[columnName] = `${schemaReference}.${tableReference}(${columnReference})`;
    },
    constraints: [
        // Additional constraints can be added here if needed
    ]
};





interface UserInternalSQLServerInterface {
    email: string;
    userName: string;
    password: string;
    salt: string;
    avatarURL: string;
    planId: string;
    stripeSubscriptionId: string;
    status: string;
    createDate: Date;
    lastActivityDate: Date;
    firstName: string;
    lastName: string;
    countryISO: string;
    address: string;
    city: string;
    phone: string;
    isAdmin: boolean;
    _id: BigInt;
}

export interface UserInternalSQLServer extends UserInternalSQLServerInterface {};


// Class Implementation
export class UserInternalSQLServer implements UserInternalSQLServerInterface {
    constructor(data: UserInternalSQLServerInterface) {
        Object.assign(this, data);
    }
}
export function isKeyOfUserInternalSQLServer(key: string): key is keyof UserInternalSQLServerInterface {
    return key in UserInternalSQLServer.prototype;
}


export function loadUserFromSQLServer(userSQLServer: UserInternalSQLServer | null): User | null {
    const conversionRules = {
        _id: String
    };

    return userSQLServer ? genericConversion(userSQLServer, conversionRules): null;
}

export function dumpUserToSQLServer(user: Partial<User>): UserInternalSQLServer {
    const conversionRules = {
        _id: parseInt
    };

    return genericConversion(user, conversionRules);
}