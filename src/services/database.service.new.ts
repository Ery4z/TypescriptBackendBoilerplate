import dotenv from "dotenv";
import { createDatabaseServiceUser } from "../factories/databaseServiceUserFactory";
import IDatabaseServiceUser from "../interfaces/IDatabaseServiceUser";

export let databaseServiceUser: IDatabaseServiceUser;

//TODO: Pass the database connection in the factory

export async function connectToDatabase() {
    dotenv.config();

    

    // Use factory to create the database service
    databaseServiceUser = await createDatabaseServiceUser({
        databaseType: "SQLServer"
    });

    console.log(`Successfully connected to database`);
}
