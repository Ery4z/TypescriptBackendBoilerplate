// External dependencies
import { ObjectId } from "mongodb"
import { EmailValidator } from "./emailValidators"
import { convertArrayToObjectId, convertToObjectId, genericConversion, convertArrayObjectIdToString, convertObjectIdToString } from "../tools/typeConversion";

export class EmailValidatorInternalMongo{
    constructor(
        public email: string,
        public expirationDate: Date,
        public userId: ObjectId,
        public isUsed: boolean,
        public _id: ObjectId
    ) {}
}

export function loadEmailValidatorFromMongo(emailValidatorMongo: EmailValidatorInternalMongo | null):EmailValidator | null {
    const conversionRules = {
        userId: convertObjectIdToString,
        _id: convertObjectIdToString
    };

    return emailValidatorMongo ? genericConversion(emailValidatorMongo, conversionRules): null;
}

export function dumpEmailValidatorToMongo(emailValidator: Partial<EmailValidator>) : EmailValidatorInternalMongo{
    const conversionRules = {
        userId: convertToObjectId,
        _id: convertToObjectId
    };

    return emailValidator ? genericConversion(emailValidator, conversionRules): null;


}