// External dependencies
import { ObjectId } from "mongodb"

//Handle recovery expiration from env
const recoveryExpiration = process.env.PASSWORD_RECOVERY_EXPIRATION || "0.5"

// Class Implementation
export class PasswordRecovery {
    constructor(
        public expirationDate: Date,
        public userId: string,
        public isUsed: boolean,
        public _id: string
    ) {}
}

export function passwordRecoveryFactory(userId: string) {
    return new PasswordRecovery(
        new Date(Date.now() + parseFloat(recoveryExpiration) * 60 * 60 * 1000),
        userId,
        false,
        String(new ObjectId())
    )
}
