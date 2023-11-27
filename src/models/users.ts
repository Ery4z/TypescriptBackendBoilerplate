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
        public friends: string[],
        public projects: string[],

        public _id: string
    ) {}
}

export function createDefaultAccount(user: User ){
    return {
                ...user,
                _id: String(new ObjectId()),
                status: "created",
                avatarURL: "",
                planId: "",
                stripeSubscriptionId: "",
                createDate: new Date(),
                lastActivityDate: new Date(),
                isAdmin: false,
                friends: [],
                projects: [],
            } as User
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
