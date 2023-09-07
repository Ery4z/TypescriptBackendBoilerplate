import { body } from "express-validator"

export const userNewPasswordSchema = [
    body("previousPassword").isString().isLength({ min: 1 }),
    body("newPassword").isString().isLength({ min: 1 }),
    body().custom((bodyContent) => {
        const allowedKeys = ["previousPassword", "newPassword"]
        const bodyKeys = Object.keys(bodyContent)

        // If there are any keys in bodyContent that aren't in allowedKeys, throw an error
        for (let key of bodyKeys) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Invalid key present in the body: ${key}`)
            }
        }
        // indicate validation success by returning true
        return true
    }),
]

export const loginSchema = [
    body("userId").isString().isLength({ min: 1 }),
    body("password").isString().isLength({ min: 1 }),
    body().custom((bodyContent) => {
        const allowedKeys = ["userId", "password"]
        const bodyKeys = Object.keys(bodyContent)

        // If there are any keys in bodyContent that aren't in allowedKeys, throw an error
        for (let key of bodyKeys) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Invalid key present in the body: ${key}`)
            }
        }
        // indicate validation success by returning true
        return true
    }),
]

export const createUserSchema = [
    body("userName").isString().isLength({ min: 1 }),
    body("password").isString().isLength({ min: 1 }),
    body("firstName").isString().isLength({ min: 1 }),
    body("lastName").isString().isLength({ min: 1 }),
    body("countryISO").isString().isLength({ min: 1 }),
    body("address").isString().isLength({ min: 1 }),
    body("city").isString().isLength({ min: 1 }),
    body("phone").isString().isLength({ min: 1 }),
    body("email").isEmail().isLength({ min: 1 }),
    body().custom((bodyContent) => {
        const allowedKeys = [
            "userName",
            "password",
            "firstName",
            "lastName",
            "countryISO",
            "address",
            "city",
            "phone",
            "email",
        ]
        const bodyKeys = Object.keys(bodyContent)

        // If there are any keys in bodyContent that aren't in allowedKeys, throw an error
        for (let key of bodyKeys) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Invalid key present in the body: ${key}`)
            }
        }
        // indicate validation success by returning true
        return true
    }),
]

export const recoverPasswordSchema = [
    body("newPassword").isString().isLength({ min: 1 }),
    body().custom((bodyContent) => {
        const allowedKeys = ["newPassword"]
        const bodyKeys = Object.keys(bodyContent)

        // If there are any keys in bodyContent that aren't in allowedKeys, throw an error
        for (let key of bodyKeys) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Invalid key present in the body: ${key}`)
            }
        }
        // indicate validation success by returning true
        return true
    }),
]
