import { ObjectId } from 'mongodb';

export function convertToObjectId(value: any): ObjectId | undefined {
    if (typeof value === 'string') {
        return new ObjectId(value);
    }
    return undefined;
}

export function convertArrayToObjectId(array: any[]): ObjectId[] {
    return array.map(item => convertToObjectId(item)).filter(item => item !== undefined) as ObjectId[];
}

export function convertObjectIdToString(value: any): string | undefined {
    if (value instanceof ObjectId) {
        return value.toHexString();
    }
    return undefined;
}

export function convertArrayObjectIdToString(array: any[]): string[] {
    return array.map(item => convertObjectIdToString(item)).filter(item => item !== undefined) as string[];
}



export function genericConversion(source: any, conversionRules: Record<string, (value: any) => any>): any {
    const target: any = {};
    for (const key in source) {
        if (source[key] !== undefined) {
            if (conversionRules[key]) {
                target[key] = conversionRules[key](source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}
