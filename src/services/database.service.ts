// External Dependencies
import * as mongoDB from "mongodb"
import * as dotenv from "dotenv"

// Global Variables

export const collections: {
    users?: mongoDB.Collection
    emailValidators?: mongoDB.Collection
    passwordRecoveries?: mongoDB.Collection
} = {}

// Initialize Connection

export async function connectToDatabase() {
    dotenv.config()

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(
        process.env.DB_CONN_STRING || ""
    )

    await client.connect()

    const db: mongoDB.Db = client.db(process.env.DB_NAME)

    const usersCollection: mongoDB.Collection = db.collection(
        process.env.USERS_COLLECTION_NAME || "users"
    )

    const emailValidatorsCollection: mongoDB.Collection = db.collection(
        process.env.EMAIL_VALIDATORS_COLLECTION_NAME || "emailValidators"
    )

    const passwordRecoveriesCollection: mongoDB.Collection = db.collection(
        process.env.PASSWORD_RECOVERIES_COLLECTION_NAME || "passwordRecoveries"
    )

    collections.users = usersCollection
    collections.emailValidators = emailValidatorsCollection
    collections.passwordRecoveries = passwordRecoveriesCollection

    console.log(`Successfully connected to database: ${db.databaseName}`)
}

