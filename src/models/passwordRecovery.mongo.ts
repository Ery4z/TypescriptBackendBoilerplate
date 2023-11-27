// External dependencies
import { ObjectId } from "mongodb"
import { PasswordRecovery } from "./passwordRecovery";
import { convertArrayToObjectId, convertToObjectId, genericConversion, convertArrayObjectIdToString, convertObjectIdToString } from "../tools/typeConversion";

// Class Implementation
export class PasswordRecoveryInternalMongo {
    constructor(
        public expirationDate: Date,
        public userId: ObjectId,
        public isUsed: boolean,
        public _id: ObjectId
    ) {}
}

export function loadPasswordRecoveryFromMongo(internalMongo: PasswordRecoveryInternalMongo | null): PasswordRecovery | null {
    const conversionRules = {
        userId: convertObjectIdToString,
        _id: convertObjectIdToString
    };

    return internalMongo ? genericConversion(internalMongo, conversionRules): null;

}

export function dumpPasswordRecoveryToMongo(recovery: Partial<PasswordRecovery>): PasswordRecoveryInternalMongo {

    const conversionRules = {
        userId: convertToObjectId,
        _id: convertToObjectId
    };

    return recovery ? genericConversion(recovery, conversionRules): null;

}