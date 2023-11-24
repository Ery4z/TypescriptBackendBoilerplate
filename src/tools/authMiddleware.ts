import { Request, Response, NextFunction } from "express"
import { verifyToken } from "./jwt"
import dotenv from "dotenv"
//TODO: Create test for this function
dotenv.config()

/**
 * Middleware used to authenticate a user
 * @param req
 * @param res
 * @param next
 * @returns
 */
function Authenticate(req: Request, res: Response, next: NextFunction) {
    //! This is a temporary bypass for testing purposes
    //! Remove this when you are ready to implement authentication
    if (process.env.DEBUG_BYPASS_AUTH === "true") {
        next()
        return
    }

    if (req.headers.authorization === undefined) {
        res.status(401).send("Unauthorized")
        return
    }

    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
        res.status(401).send("Unauthorized")
        return
    }

    try {
        const tokenPayload = verifyToken(token) as {
            adm: boolean
            _id: string
            exp: number
        }
        //
        if (tokenPayload.exp < Date.now() / 1000) {
            res.status(401).send("Unauthorized")
            return
        }
        if (!verifyToken(token)) {
            res.status(401).send("Unauthorized")
            return
        }
    } catch (error) {
        res.status(401).send("Unauthorized")
        return
    }
    next()
}
/**
 * Middleware used to authenticate a user with the corresponding id
 * @param req
 * @param res
 * @param next
 * @returns
 */
function AuthenticateCorrespondingId(
    req: Request,
    res: Response,
    next: NextFunction
) {
    //! This is a temporary bypass for testing purposes
    //! Remove this when you are ready to implement authentication
    console.log("AuthenticateCorrespondingId triggered for", req.path)
    if (process.env.DEBUG_BYPASS_AUTH === "true") {
        next()
        return
    }

    if (req.headers.authorization === undefined) {
        res.status(401).send("Unauthorized1")
        return
    }

    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
        res.status(401).send("Unauthorized2")
        return
    }

    try {
        const tokenPayload = verifyToken(token) as {
            adm: boolean
            _id: string
            exp: number
        }
        if (!tokenPayload) {
            res.status(401).send("Unauthorized3")
            return
        }
        //
        if (tokenPayload.exp < Date.now() / 1000) {
            res.status(401).send("Unauthorized4")
            return
        }

        if (tokenPayload._id !== req.params.id) {
            res.status(401).send("Unauthorized5")
            return
        }
    } catch (error) {
        res.status(401).send("Unauthorized6")
        return
    }

    next()
}

/**
 * Middleware used to authenticate an admin user
 * @param req
 * @param res
 * @param next
 * @returns
 */
function AuthenticateAdmin(req: Request, res: Response, next: NextFunction) {
    //! This is a temporary bypass for testing purposes
    //! Remove this when you are ready to implement authentication
    if (process.env.DEBUG_BYPASS_AUTH === "true") {
        next()
        return
    }

    if (!req.headers.authorization) {
        res.status(401).send("Unauthorized")
        return
    }

    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
        res.status(401).send("Unauthorized")
        return
    }

    try {
        const tokenPayload = verifyToken(token) as {
            adm: boolean
            _id: string
            exp: number
        }

        // Check for expiration and admin flag
        if (tokenPayload.exp < Date.now() / 1000 || !tokenPayload.adm) {
            res.status(401).send("Unauthorized")
            return
        }

        if (!tokenPayload) {
            res.status(401).send("Unauthorized")
            return
        }
    } catch (error) {
        res.status(401).send("Unauthorized")
        return
    }

    next()
}

export { Authenticate, AuthenticateAdmin, AuthenticateCorrespondingId }
