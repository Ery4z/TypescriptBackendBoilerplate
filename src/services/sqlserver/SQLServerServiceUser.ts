import { ObjectId, Collection } from "mongodb";
import { PasswordRecovery } from "../../models/passwordRecovery";
import { PasswordRecoveryInternalMongo, dumpPasswordRecoveryToMongo, loadPasswordRecoveryFromMongo } from "../../models/passwordRecovery.mongo";
import { User } from "../../models/users";
import { UserInternalSQLServer, UserSQLServerMapping,loadUserFromSQLServer,dumpUserToSQLServer,isKeyOfUserInternalSQLServer } from "../../models/users.sqlserver";
import { EmailValidator } from "../../models/emailValidators";
import { EmailValidatorSQLServer, EmailValidatorSQLServerMapping, dumpEmailValidatorToSQLServer, isKeyOfEmailValidatorSQLServer, loadEmailValidatorFromSQLServer } from "../../models/emailValidators.sqlserver";
import { PasswordRecoverySQLServer, PasswordRecoverySQLServerMapping, dumpPasswordRecoveryToSQLServer, isKeyOfPasswordRecoverySQLServer, loadPasswordRecoveryFromSQLServer } from "../../models/passwordRecover.sqlserver";

import IDatabaseServiceUser from "../../interfaces/IDatabaseServiceUser"
import sql from 'mssql';
import { TableMapping, ensureTableExists } from "../../tools/sqlToolbox";


class SQLServerServiceUser implements IDatabaseServiceUser {
    private pool: sql.ConnectionPool
    private userTableConfig: TableMapping;
    private passwordRecoveryTableConfig: TableMapping;
    private emailVerificationTableConfig: TableMapping;
    constructor(
        pool: sql.ConnectionPool,
    ) {
        this.pool = pool;
        this.userTableConfig = UserSQLServerMapping
        this.passwordRecoveryTableConfig = PasswordRecoverySQLServerMapping
        this.emailVerificationTableConfig = EmailValidatorSQLServerMapping


        this.emailVerificationTableConfig.setForeignKey("userId",UserSQLServerMapping.schema,UserSQLServerMapping.tableName,UserSQLServerMapping.primaryKey)
        this.passwordRecoveryTableConfig.setForeignKey("userId",UserSQLServerMapping.schema,UserSQLServerMapping.tableName,UserSQLServerMapping.primaryKey)
        
        
        

    
    }
    async initDatabase(): Promise<Boolean>{
        await ensureTableExists(this.pool, this.userTableConfig)
            
        await ensureTableExists(this.pool,this.emailVerificationTableConfig)
        await ensureTableExists(this.pool,this.passwordRecoveryTableConfig)
    
        return true
    }

    async _queryDatabaseUser(query: string): Promise<(UserInternalSQLServer | null)[]> {
        try {
            const result = await this.pool.request().query(query);
            return result.recordset.map(row => new UserInternalSQLServer(row));
        } catch (err) {
            console.error('Error running query:', err);
            throw err;
        }
    }

    async queryDatabasePasswordRecovery(query: string): Promise<(PasswordRecoverySQLServer | null)[]> {
        try {
            const result = await this.pool.request().query(query);
            return result.recordset.map(row => new PasswordRecoverySQLServer(row));
        } catch (err) {
            console.error('Error running query:', err);
            throw err;
        }
    }

    async queryDatabaseEmailValidator(query: string): Promise<(EmailValidatorSQLServer | null)[]> {
        try {
            const result = await this.pool.request().query(query);
            return result.recordset.map(row => new EmailValidatorSQLServer(row));
        } catch (err) {
            console.error('Error running query:', err);
            throw err;
        }
    }

    async getUserById(id: string): Promise<User | null> {
        const result = await this._queryDatabaseUser(`SELECT * FROM ${this.userTableConfig.tableName} WHERE ${this.userTableConfig.primaryKey} = '${id}'`);
        if (result.length === 0) {
            return null; // No user found
        }
        return loadUserFromSQLServer(result[0]); // Assuming the first result is the desired user
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const result = await this._queryDatabaseUser(`SELECT * FROM ${this.userTableConfig.tableName} WHERE email = '${email}'`);
        if (result.length === 0) {
            return null; // No user found
        }
        return loadUserFromSQLServer(result[0]); // Assuming the first result is the desired user
    }

    async insertUser(user: User): Promise<string> {
        // Convert the User object to a UserInternalSQLServer instance
        const userForSql: UserInternalSQLServer = dumpUserToSQLServer(user);
    
        // Dynamically construct the fields and values for the SQL query
        const fields = Object.keys(userForSql).filter(key => key !== this.userTableConfig.primaryKey).join(', ');
        const values = Object.entries(userForSql).filter(([key,value]) => key !== this.userTableConfig.primaryKey).map(([key,value]) => {
            if (typeof value === 'string') {
                return `'${value.replace(/'/g, "''")}'`; // Escape single quotes for strings
            } else if (value instanceof Date) {
                return `'${value.toISOString()}'`; // Convert dates to ISO string
            } else if (typeof value === 'boolean') {
                return value ? '1' : '0'; // Convert boolean to 1 or 0
            }
            return value; // Numbers and other types
        }).join(', ');
    
        const query = `
            INSERT INTO ${this.userTableConfig.tableName} (${fields})
            VALUES (${values});
            SELECT SCOPE_IDENTITY() AS id;
        `;
    
        try {
            const result = await this.pool.request().query(query);
            return result.recordset[0].id.toString();
        } catch (err) {
            console.error('Error running insert query:', err);
            throw err;
        }
    }
    

    async updateUser(id: string, update: Partial<User>): Promise<boolean> {
    
        // Dynamically construct the fields and values for the SQL query
        const updateSet = Object.entries(update).filter(([[key, value]]) => key !== this.userTableConfig.primaryKey).map(([key, value]) => `${key} = '${value}'`).join(', ');
        
        const query = `UPDATE ${this.userTableConfig.tableName} SET ${updateSet} WHERE ${this.userTableConfig.primaryKey} = '${id}'`;

        const result = await this.pool.request().query(query);
        
        return result.rowsAffected[0] === 1;
    }

    async deleteUser(id: string): Promise<boolean> {
        const query = `UPDATE ${this.userTableConfig.tableName} SET status = 'deleted' WHERE ${this.userTableConfig.primaryKey} = '${id}'`;

        const result = await this.pool.request().query(query);
        return result.rowsAffected[0] === 1;
    }

    async getAllUsers(): Promise<(User | null)[]>{
        const result = await this._queryDatabaseUser(`SELECT * FROM ${this.userTableConfig.tableName}`);
        if (result.length === 0) {
            return [null]; // No user found
        }
        return result.map(row => loadUserFromSQLServer(row));
    }

    async insertPasswordRecovery(passwordRecovery: PasswordRecovery): Promise<string> {
        const passwordRecoveryForSql: PasswordRecoverySQLServer = dumpPasswordRecoveryToSQLServer(passwordRecovery);
    
        const fields = Object.keys(passwordRecoveryForSql)
            .filter(key => key !== this.passwordRecoveryTableConfig.primaryKey)
            .join(', ');
    
        const values = Object.entries(passwordRecoveryForSql)
            .filter(([key, _]) => key !== this.passwordRecoveryTableConfig.primaryKey)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`; // Escape single quotes for strings
                } else if (value instanceof Date) {
                    return `'${value.toISOString()}'`; // Convert dates to ISO string
                } else if (typeof value === 'boolean') {
                    return value ? '1' : '0'; // Convert boolean to 1 or 0
                }
                return value; // Numbers and other types
            })
            .join(', ');
    
        const query = `
            INSERT INTO ${this.passwordRecoveryTableConfig.tableName} (${fields})
            VALUES (${values});
            SELECT SCOPE_IDENTITY() AS id;
        `;
    
        try {
            const result = await this.pool.request().query(query);
            return result.recordset[0].id.toString();
        } catch (err) {
            console.error('Error running insert query:', err);
            throw err;
        }
    }

    async getPasswordRecoveryById( id: string): Promise<PasswordRecovery | null> {
    
        const result = await this.queryDatabasePasswordRecovery(`SELECT * FROM ${this.passwordRecoveryTableConfig.tableName} WHERE ${this.passwordRecoveryTableConfig.primaryKey} = '${id}'`);
        return result[0] ? loadPasswordRecoveryFromSQLServer(result[0]) : null
    }

    async updatePasswordRecovery(id: string, update: Partial<PasswordRecovery>): Promise<boolean> {
        const updateSet = Object.entries(update).filter(([[key, value]]) => key !== this.passwordRecoveryTableConfig.primaryKey).map(([key, value]) => `${key} = '${value}'`).join(', ');
        
        const query = `UPDATE ${this.passwordRecoveryTableConfig.tableName} SET ${updateSet} WHERE ${this.passwordRecoveryTableConfig.primaryKey} = '${id}'`;

        const result = await this.pool.request().query(query);
        
        return result.rowsAffected[0] === 1;
    }

    async insertEmailValidator(emailValidator: EmailValidator): Promise<string> {
        const emailValidatorForSql: EmailValidatorSQLServer = dumpEmailValidatorToSQLServer(emailValidator);
    
        const fields = Object.keys(emailValidatorForSql)
            .filter(key => key !== this.emailVerificationTableConfig.primaryKey)
            .join(', ');
    
        const values = Object.entries(emailValidatorForSql)
            .filter(([key, _]) => key !== this.emailVerificationTableConfig.primaryKey)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`; // Escape single quotes for strings
                } else if (value instanceof Date) {
                    return `'${value.toISOString()}'`; // Convert dates to ISO string
                } else if (typeof value === 'boolean') {
                    return value ? '1' : '0'; // Convert boolean to 1 or 0
                }
                return value; // Numbers and other types
            })
            .join(', ');
    
        const query = `
            INSERT INTO ${this.emailVerificationTableConfig.tableName} (${fields})
            VALUES (${values});
            SELECT SCOPE_IDENTITY() AS id;
        `;
    
        try {
            const result = await this.pool.request().query(query);
            return result.recordset[0].id.toString();
        } catch (err) {
            console.error('Error running insert query:', err);
            throw err;
        }
    }
    

    async getEmailValidatorById(id: string): Promise<EmailValidator | null> {
        const result = await this.queryDatabaseEmailValidator(`SELECT * FROM ${this.emailVerificationTableConfig.tableName} WHERE ${this.emailVerificationTableConfig.primaryKey} = '${id}'`);
        return result[0] ? loadEmailValidatorFromSQLServer(result[0]) : null
        
    }

    async updateEmailValidator(id: string, update: Partial<EmailValidator>): Promise<boolean> {
        const updateSet = Object.entries(update).filter(([[key, value]]) => key !== this.emailVerificationTableConfig.primaryKey).map(([key, value]) => `${key} = '${value}'`).join(', ');
        
        const query = `UPDATE ${this.emailVerificationTableConfig.tableName} SET ${updateSet} WHERE ${this.emailVerificationTableConfig.primaryKey} = '${id}'`;

        const result = await this.pool.request().query(query);
        
        return result.rowsAffected[0] === 1;
    }

    // Add other methods as needed for each route
}

export default SQLServerServiceUser;
