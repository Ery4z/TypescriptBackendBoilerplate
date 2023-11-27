import { ObjectId, Collection } from "mongodb";
import { PasswordRecovery } from "../../models/passwordRecovery";
import { PasswordRecoveryInternalMongo, dumpPasswordRecoveryToMongo, loadPasswordRecoveryFromMongo } from "../../models/passwordRecovery.mongo";
import { User } from "../../models/users";
import { UserInternalMongo, loadUserFromMongo, dumpUserToMongo } from "../../models/users.mongo";
import { EmailValidator } from "../../models/emailValidators";
import { EmailValidatorInternalMongo, loadEmailValidatorFromMongo,dumpEmailValidatorToMongo } from "../../models/emailValidators.mongo";
import IDatabaseServiceUser from "../../interfaces/IDatabaseServiceUser"

class MongoDBUserService implements IDatabaseServiceUser {
    private usersCollection: Collection<UserInternalMongo>;
    private passwordRecoveriesCollection: Collection<PasswordRecoveryInternalMongo>;
    private emailValidatorsCollection: Collection<EmailValidatorInternalMongo>;

    constructor(
        usersCollection: Collection<UserInternalMongo>,
        passwordRecoveriesCollection: Collection<PasswordRecoveryInternalMongo>,
        emailValidatorsCollection: Collection<EmailValidatorInternalMongo>
    ) {
        this.usersCollection = usersCollection;
        this.passwordRecoveriesCollection = passwordRecoveriesCollection;
        this.emailValidatorsCollection = emailValidatorsCollection;
    }

    async getUserById(id: string): Promise<User | null> {
        return loadUserFromMongo(await this.usersCollection.findOne({ _id: new ObjectId(id) }));
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return loadUserFromMongo(await this.usersCollection.findOne({ email: email }));
    }

    async insertUser(user: User): Promise<string> {
        const result = await this.usersCollection.insertOne(dumpUserToMongo(user));
        return String(result.insertedId);
    }

    async updateUser(id: string, update: Partial<User>): Promise<boolean> {
        const result = await this.usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: dumpUserToMongo(update) });
        return result.modifiedCount === 1;
    }

    async insertPasswordRecovery(passwordRecovery: PasswordRecovery): Promise<string> {
        const result = await this.passwordRecoveriesCollection.insertOne(dumpPasswordRecoveryToMongo(passwordRecovery));
        return String(result.insertedId);
    }

    async getPasswordRecoveryById(id: string): Promise<PasswordRecovery | null> {
        return loadPasswordRecoveryFromMongo(await this.passwordRecoveriesCollection.findOne({ _id: new ObjectId(id) }) );
    }

    async updatePasswordRecovery(id: string, update: Partial<PasswordRecovery>): Promise<boolean> {
        const result = await this.passwordRecoveriesCollection.updateOne({ _id: new ObjectId(id) }, { $set: dumpPasswordRecoveryToMongo(update) });
        return result.modifiedCount === 1;
    }

    async insertEmailValidator(emailValidator: EmailValidator): Promise<string> {
        const result = await this.emailValidatorsCollection.insertOne(dumpEmailValidatorToMongo(emailValidator));
        return String(result.insertedId);
    }

    async getEmailValidatorById(id: string): Promise<EmailValidator | null> {
        return loadEmailValidatorFromMongo(await this.emailValidatorsCollection.findOne({ _id: new ObjectId(id) }));
    }

    async updateEmailValidator(id: string, update: Partial<EmailValidator>): Promise<boolean> {
        const result = await this.emailValidatorsCollection.updateOne({ _id: new ObjectId(id) }, { $set: dumpEmailValidatorToMongo(update) });
        return result.modifiedCount === 1;
    }

    // Add other methods as needed for each route
}

export default MongoDBUserService;
