import IDatabaseServiceUser from "../interfaces/IDatabaseServiceUser";
import MongoDBServiceUser from "../services/mongodb/mongoDBServiceUser";
import * as mongoDB from "mongodb"
import sql, { config } from 'mssql';
import { UserInternalMongo } from "../models/users.mongo";
import { PasswordRecoveryInternalMongo } from "../models/passwordRecovery.mongo";
import { EmailValidatorInternalMongo } from "../models/emailValidators.mongo";
import { MongoClient, Db, Collection } from "mongodb";

import dotenv from "dotenv";
import SQLServerServiceUser from "../services/sqlserver/SQLServerServiceUser";
// Import other database service implementations as needed

export async function createDatabaseServiceUser(config: any): Promise<IDatabaseServiceUser> {
    dotenv.config();




    // Example configuration check
    if (config.databaseType === "MongoDB") {
        // Assuming MongoDBServiceUser is already initialized with collections
        // TODO: Add collection system

        const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING || "");
        await client.connect();

        const db: Db = client.db(process.env.DB_NAME);

        // Initialize collections
        const usersCollection: Collection<UserInternalMongo> = db.collection(process.env.USERS_COLLECTION_NAME || "users");
        const emailValidatorsCollection: Collection<EmailValidatorInternalMongo> = db.collection(process.env.EMAIL_VALIDATORS_COLLECTION_NAME || "emailValidators");
        const passwordRecoveriesCollection: Collection<PasswordRecoveryInternalMongo> = db.collection(process.env.PASSWORD_RECOVERIES_COLLECTION_NAME || "passwordRecoveries");

        return new MongoDBServiceUser(usersCollection,passwordRecoveriesCollection,emailValidatorsCollection);
    }
    
    if (config.databaseType == "SQLServer") {
        const sqlConfig: config = {
            user: process.env.SQL_USER || "user",
            password: process.env.SQL_PASSWORD || "password",
            database: process.env.SQL_DATABASE || "example-db",
            server: process.env.SQL_SERVER || "example.com",
            port: parseInt(process.env.SQL_PORT || "1433"), // Default SQL Server port
            options: {
                encrypt: true, // For Azure SQL
                trustServerCertificate: false // Change to true for local dev / self-signed certs
            }
        };
        console.log(sqlConfig)
        let pool;
        try {
            pool = new sql.ConnectionPool(sqlConfig);
            await pool.connect()
            console.log('Connected to SQL Server successfully.');

        } catch (err) {
            console.error('Failed to connect to SQL Server:', err);
            throw new Error("Failed to connect to SQL Server");
        }

        try{
            const service = new SQLServerServiceUser(pool)
            await service.initDatabase()
            return service
        } catch (err){
            console.error('Failed to initialize user service:', err);
            throw new Error("Failed to initialize user service");
        }


    }
    throw new Error("Unsupported database type");
}
