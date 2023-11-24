import { ObjectId, Collection } from "mongodb";
import { PasswordRecovery } from "../../models/passwordRecovery";
import { User } from "../../models/users";
import { EmailValidator } from "../../models/emailValidators";
import IDatabaseServiceUser from "../../interfaces/IDatabaseServiceUser"

class MongoDBUserService implements IDatabaseServiceUser {
    private usersCollection: Collection<User>;
    private passwordRecoveriesCollection: Collection<PasswordRecovery>;
    private emailValidatorsCollection: Collection<EmailValidator>;

    constructor(
        usersCollection: Collection<User>,
        passwordRecoveriesCollection: Collection<PasswordRecovery>,
        emailValidatorsCollection: Collection<EmailValidator>
    ) {
        this.usersCollection = usersCollection;
        this.passwordRecoveriesCollection = passwordRecoveriesCollection;
        this.emailValidatorsCollection = emailValidatorsCollection;
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.usersCollection.findOne({ _id: new ObjectId(id) }) as User | null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.usersCollection.findOne({ email: email }) as User | null;
    }

    async insertUser(user: User): Promise<string> {
        const result = await this.usersCollection.insertOne(user);
        return String(result.insertedId);
    }

    async updateUser(id: string, update: Partial<User>): Promise<boolean> {
        const result = await this.usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });
        return result.modifiedCount === 1;
    }

    async insertPasswordRecovery(passwordRecovery: PasswordRecovery): Promise<string> {
        const result = await this.passwordRecoveriesCollection.insertOne(passwordRecovery);
        return String(result.insertedId);
    }

    async getPasswordRecoveryById(id: string): Promise<PasswordRecovery | null> {
        return await this.passwordRecoveriesCollection.findOne({ _id: new ObjectId(id) }) as PasswordRecovery | null;
    }

    async updatePasswordRecovery(id: string, update: Partial<PasswordRecovery>): Promise<boolean> {
        const result = await this.passwordRecoveriesCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });
        return result.modifiedCount === 1;
    }

    async insertEmailValidator(emailValidator: EmailValidator): Promise<string> {
        const result = await this.emailValidatorsCollection.insertOne(emailValidator);
        return String(result.insertedId);
    }

    async getEmailValidatorById(id: string): Promise<EmailValidator | null> {
        return await this.emailValidatorsCollection.findOne({ _id: new ObjectId(id) }) as EmailValidator | null;
    }

    async updateEmailValidator(id: string, update: Partial<EmailValidator>): Promise<boolean> {
        const result = await this.emailValidatorsCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });
        return result.modifiedCount === 1;
    }

    // Add other methods as needed for each route
}

export default MongoDBUserService;
