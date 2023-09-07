// External dependencies
import { ObjectId } from "mongodb"

//Handle recovery expiration from env
const recoveryExpiration = process.env.PASSWORD_RECOVERY_EXPIRATION || "0.5"

// Class Implementation
export class PasswordRecovery {
    constructor(
        public expirationDate: Date,
        public userId: ObjectId,
        public isUsed: boolean,
        public _id?: ObjectId
    ) {}
}

export function passwordRecoveryFactory(userId: ObjectId) {
    return new PasswordRecovery(
        new Date(Date.now() + parseFloat(recoveryExpiration) * 60 * 60 * 1000),
        userId,
        false,
        new ObjectId()
    )
}
