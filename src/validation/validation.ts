import { body, validationResult } from "express-validator"
import { Request, Response, NextFunction } from "express"

/**
 * Use this function as a middleware factory to validate the body structure and content of a request
 * @param express-validator schema
 * @returns the middleware function
 */
export function bodyJSONValidate(schemas: any[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(schemas.map((schema) => schema.run(req)))
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            return next()
        }
        res.status(400).json({ errors: errors.array() })
    }
}

/**
 * Use this function as a middleware factory to validate the body structure and content of a request. The attributes of the body are dynamically generated from the class passed as a parameter.
 * They are all optional and of type string.
 * @param targetClass Class to generate the schema for
 * @returns
 */
export function generateSchemaMiddleware(targetClass: any) {
    // 1. Dynamically get keys from the class
    const allowedKeys = Object.keys(new targetClass())

    // 2. Create validation rules for each key
    const keyValidations = allowedKeys.map((key) => {
        return body(key).optional().isString().trim().isLength({ min: 1 })
    })

    // 3. Add a custom validator to check for extra keys
    const extraKeysValidation = body().custom((bodyContent) => {
        const bodyKeys = Object.keys(bodyContent)
        for (let key of bodyKeys) {
            if (!allowedKeys.includes(key)) {
                throw new Error(`Invalid key present in the body: ${key}`)
            }
        }
        return true // Validation success
    })

    // 4. Return the middleware
    return [...keyValidations, extraKeysValidation]
}
