import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import { createDatabaseServiceUser } from "../factories/databaseServiceUserFactory";
import IDatabaseServiceUser from "../interfaces/IDatabaseServiceUser";

export let databaseServiceUser: IDatabaseServiceUser;

//TODO: Pass the database connection in the factory

export async function connectToDatabase() {
    dotenv.config();

    const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING || "");
    await client.connect();

    const db: Db = client.db(process.env.DB_NAME);

    // Initialize collections
    const usersCollection: Collection = db.collection(process.env.USERS_COLLECTION_NAME || "users");
    const emailValidatorsCollection: Collection = db.collection(process.env.EMAIL_VALIDATORS_COLLECTION_NAME || "emailValidators");
    const passwordRecoveriesCollection: Collection = db.collection(process.env.PASSWORD_RECOVERIES_COLLECTION_NAME || "passwordRecoveries");

    // Use factory to create the database service
    databaseServiceUser = await createDatabaseServiceUser({
        databaseType: "MongoDB",
        collections: {
            users: usersCollection,
            emailValidators: emailValidatorsCollection,
            passwordRecoveries: passwordRecoveriesCollection
        }
    });

    console.log(`Successfully connected to database: ${db.databaseName}`);
}
