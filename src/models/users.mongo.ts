// External dependencies
import { ObjectId } from "mongodb"
import { User } from "./users";
import { convertArrayToObjectId, convertToObjectId, genericConversion, convertArrayObjectIdToString, convertObjectIdToString } from "../tools/typeConversion";

// Class Implementation
export class UserInternalMongo {
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

        public _id: ObjectId
    ) {}
}


export function loadUserFromMongo(userMongo: UserInternalMongo | null): User | null {
    const conversionRules = {
        _id: convertObjectIdToString
    };

    return userMongo ? genericConversion(userMongo, conversionRules): null;
}

export function dumpUserToMongo(user: Partial<User>): UserInternalMongo {
    const conversionRules = {
        _id: convertToObjectId
    };

    return genericConversion(user, conversionRules);
}