import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { User } from "../models/users"
import { ObjectId } from "mongodb"

/**
 * This function generates a JWT token for a user with the secret key set as an environment variable (JWT_SECRET_KEY)
 * @param user User object to generate token for
 * @returns JWT token
 */
export function generateToken(user: User): string {
    dotenv.config()
    if (
        typeof process.env.JWT_SECRET_KEY === undefined ||
        process.env.JWT_SECRET_KEY === undefined
    ) {
        throw new Error("JWT_SECRET_KEY is not defined")
    }

    if (
        typeof process.env.JWT_DURATION === undefined ||
        process.env.JWT_DURATION === undefined
    ) {
        throw new Error("JWT_DURATION is not defined")
    }
    const token = jwt.sign(
        { _id: user._id?.toString(), name: user.userName, adm: user.isAdmin },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_DURATION as string,
        }
    )
    return token
}

/**
 * This function verifies a JWT token with the secret key set as an environment variable (JWT_SECRET_KEY)
 * @param token Token to verify
 * @returns Decoded token payload if valid, otherwise throws an error
 */
export function verifyToken(token: string): string | jwt.JwtPayload {
    dotenv.config()
    if (
        typeof process.env.JWT_SECRET_KEY === undefined ||
        process.env.JWT_SECRET_KEY === undefined
    ) {
        throw new Error("JWT_SECRET_KEY is not defined")
    }
    return jwt.verify(token, process.env.JWT_SECRET_KEY)
}

// console.log(
//     generateToken({
//         _id: new ObjectId("64dfa361e289a0b32aecf2e5"),
//         userName: "dupond",
//         adm: true,
//     } as unknown as User)
// )
