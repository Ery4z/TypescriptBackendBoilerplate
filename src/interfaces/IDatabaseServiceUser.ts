import { User } from "../models/users";
import { PasswordRecovery } from "../models/passwordRecovery";
import { EmailValidator } from "../models/emailValidators";

interface IDatabaseServiceUser {
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    insertUser(user: User): Promise<string>;
    updateUser(id: string, update: Partial<User>): Promise<boolean>;
    insertPasswordRecovery(passwordRecovery: PasswordRecovery): Promise<string>;
    getPasswordRecoveryById(id: string): Promise<PasswordRecovery | null>;
    updatePasswordRecovery(id: string, update: Partial<PasswordRecovery>): Promise<boolean>;
    insertEmailValidator(emailValidator: EmailValidator): Promise<string>;
    getEmailValidatorById(id: string): Promise<EmailValidator | null>;
    updateEmailValidator(id: string, update: Partial<EmailValidator>): Promise<boolean>;
    // Add other method signatures as needed for each route
}

export default IDatabaseServiceUser;
