import IDatabaseServiceUser from "../interfaces/IDatabaseServiceUser";
import MongoDBServiceUser from "../services/mongodb/mongoDBServiceUser";
import * as mongoDB from "mongodb"
import * as dotenv from "dotenv"
import {User} from "../models/users"
import { PasswordRecovery } from "../models/passwordRecovery";
import { EmailValidator } from "../models/emailValidators";
// Import other database service implementations as needed

export async function createDatabaseServiceUser(config: any): Promise<IDatabaseServiceUser> {
    // Example configuration check
    if (config.databaseType === "MongoDB") {
        // Assuming MongoDBServiceUser is already initialized with collections
        // TODO: Add collection system
        return new MongoDBServiceUser(config.collections.users,config.collections.passwordRecoveries,config.collections.emailValidators);
    }
    // Add other database types as needed
    // ...
    throw new Error("Unsupported database type");
}
