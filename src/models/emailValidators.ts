// External dependencies
import { ObjectId } from "mongodb"

//Handle validation expiration from env
const validationExpiration = process.env.EMAIL_VALIDATION_EXPIRATION || "0.5"

// Class Implementation
export class EmailValidator {
    constructor(
        public email: string,
        public expirationDate: Date,
        public userId: ObjectId,
        public isUsed: boolean,
        public _id?: ObjectId
    ) {}
}

export function emailValidatorFactory(email: string, userId: ObjectId) {
    return new EmailValidator(
        email,
        new Date(
            Date.now() + parseFloat(validationExpiration) * 60 * 60 * 1000
        ),
        userId,
        false,
        new ObjectId()
    )
}
