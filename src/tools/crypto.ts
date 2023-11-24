import bcrypt from "bcrypt"

const saltRounds = 10

/**
 * Used to hash a string with a salt, the salt is generated automatically and the saltround is set to 10
 * @param toHash String to hash
 * @returns hashed string
 */
export function hashWithSalt(toHash: string) {
    return bcrypt.hash(toHash, saltRounds)
}
/**
 * Used to compare a string with a hash (ex. password with hashed password)
 * @param toCompare String input to compare with the hash
 * @param hash Hashed string to compare with the input
 * @returns true if the input matches the hash, false otherwise
 */
export function compareHash(toCompare: string, hash: string) {
    return bcrypt.compare(toCompare, hash)
}
