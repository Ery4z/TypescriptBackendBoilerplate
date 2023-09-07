// External dependencies
import { ObjectId } from "mongodb"

// Class Implementation
export class User {
    constructor(
        public email: string,
        public userName: string,
        public password: string,
        public salt: string,
        public avatarURL: string,
        public planId: string,
        public stripeSubscriptionId: string,
        public status: string,
        public createDate: Date,
        public lastActivityDate: Date,

        public firstName: string,
        public lastName: string,
        public countryISO: string,
        public address: string,
        public city: string,
        public phone: string,
        public isAdmin: boolean,
        public friends: ObjectId[],
        public projects: ObjectId[],

        public _id?: ObjectId
    ) {}
}

export function createDummyUser() {
    return new User(
        "dupond@gmail.com",
        "dupond",
        "passw0rddd",
        "saltexample",
        "avatarurl.com",
        "stripeIdPlanExample",
        "stripeSubscriptionIdExemple",
        "created",
        new Date(),
        new Date(),
        "michel",
        "dupond",
        "FR",
        "1 avenue de la république",
        "Paris",
        "+33102030405",
        false,
        [],
        []
    )
}

/**
 * This class is used to specify the fields that can be edited by the user publicly (from the client side)
 */
export class UserPublicEdit {
    constructor(
        public userName: string,
        public avatarURL: string,
        public countryISO: string,
        public address: string,
        public city: string,
        public phone: string
    ) {}
}
