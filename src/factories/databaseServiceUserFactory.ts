import IDatabaseServiceUser from "../interfaces/IDatabaseServiceUser";
import MongoDBServiceUser from "../services/mongodb/mongoDBServiceUser";
// Import other database service implementations as needed

export function createDatabaseServiceUser(config: any): IDatabaseServiceUser {
    // Example configuration check
    if (config.databaseType === "MongoDB") {
        // Assuming MongoDBServiceUser is already initialized with collections
        // TODO: Add collection system
        return new MongoDBServiceUser(/* pass collections here */);
    }
    // Add other database types as needed
    // ...
    throw new Error("Unsupported database type");
}
