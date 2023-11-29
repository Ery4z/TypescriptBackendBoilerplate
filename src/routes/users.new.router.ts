// External Dependencies
import express, { Request, Response } from "express"
import { ObjectId, Filter } from "mongodb"
import { collections } from "../services/database.service"
import {databaseServiceUser} from "../services/database.service.new"
import { User, createDefaultAccount, UserPublicEdit } from "../models/users"
import {
    emailValidatorFactory,
    EmailValidator,
} from "../models/emailValidators"
import { generateToken } from "../tools/jwt"
import {
    Authenticate,
    AuthenticateAdmin,
    AuthenticateCorrespondingId,
} from "../tools/authMiddleware"

import { compareHash, hashWithSalt } from "../tools/crypto"

import {
    bodyJSONValidate,
    generateSchemaMiddleware,
} from "../validation/validation"
import {
    userNewPasswordSchema,
    loginSchema,
    createUserSchema,
    recoverPasswordSchema,
} from "../validation/usersValidation"

import {
    passwordRecoveryFactory,
    PasswordRecovery,
} from "../models/passwordRecovery"

import {
    sendValidationEmail,
    sendPasswordRecoveryEmail,
} from "../tools/smtp_utils"
import dotenv from "dotenv"

// Global Config
export const usersRouterNew = express.Router()

usersRouterNew.use(express.json())

dotenv.config()

const PASSWORD_RECOVERY_FRONTEND_HANDLED =
    process.env.PASSWORD_RECOVERY_FRONTEND_HANDLED == "true" ? true : false

/**
 * Route to get user information by id
 * @require User JWT token
 */
usersRouterNew.get(
    "/:id",
    AuthenticateCorrespondingId,
    async (req: Request, res: Response) => {
        console.log("GET /users/:id")
        const id = req?.params?.id
        // TODO: Review the information returned to the user

        try {
            let user
            try{
                user = await databaseServiceUser.getUserById(id)
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }

            if (user){
                res.status(200).send(user)
                return
            }
            res.status(404).send("User not found")
            return

            
        } catch (error) {
            res.status(404).send(
                `Unable to find matching document with id: ${req.params.id}`
            )
        }
    }
)

usersRouterNew.get(
    "/recoverpasswordrequest/:email",
    async (req: Request, res: Response) => {
        const email = req?.params?.email
        // Lets check if the email is valid and is given in the query parameters
        if (!email) {
            res.status(400).send("Email is required")
            return
        }

        try {

            let user
            try {
                user = await databaseServiceUser.getUserByEmail(email)
            } catch {
                res.status(500).send(
                    `Error accessing to the user database`
                )
                return
            }

            // Do not inform the client if the email do not exist
            if (!user) {
                res.status(200).send(
                    "An email has been sent to the email address if it exists in our database"
                )
                return
            }

            const passwordRecovery = passwordRecoveryFactory(user._id)
            

            try{
                databaseServiceUser.insertPasswordRecovery(passwordRecovery)
            } catch (error) {
                res.status(500).send(
                    `Error accessing to the password recovery database`
                )
                return
            }


            await sendPasswordRecoveryEmail(user.email,
                `${process.env.APP_URL}/users/recoverpassword/` +
                    passwordRecovery._id!.toString())

            res.status(200).send(
                "An email has been sent to the email address if it exists in our database"
            )

        } catch (error) {
            res.status(500).send(
                "An error occured while trying to recover the password"
            )
        }
    }
)

usersRouterNew.get("/recoverpassword/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id
    res.render("recoverPassword.ejs", {
        url: `${process.env.APP_URL}/users/recoverpassword/` + id,
    })
})

usersRouterNew.post(
    "/recoverpassword/:id",
    bodyJSONValidate(recoverPasswordSchema),
    async (req: Request, res: Response) => {
        const id = req?.params?.id

        let passwordRecovery;
        try{
            passwordRecovery = await databaseServiceUser.getPasswordRecoveryById(id)
        } catch (error) {
            res.status(500).send(
                `Error accessing to the password recovery database`
            )
            return
        }
        if (!passwordRecovery) {
            res.status(404).send("Password recovery link not found")
            return
        }

        // Verify the expiration date or already used
        if (
            passwordRecovery.expirationDate < new Date() ||
            passwordRecovery.isUsed
        ) {
            res.status(401).send(
                "This link has expired or has been already used"
            )
            return
        }

        // Get user associated
        let user;
        try {
            user = await databaseServiceUser.getUserById(passwordRecovery.userId)
        } catch (error) {
            res.status(500).send(
                `Error accessing to the user database`
            )
            return
            
        }

        if (!user) {
            res.status(404).send("User not found")
            return
        }

        // Update the user password

        const userEdit = {
            password: await hashWithSalt(req.body.newPassword),
        }
        let isUpdated
        try {
            isUpdated = await databaseServiceUser.updateUser(passwordRecovery.userId,userEdit)
        } catch {
            res.status(500).send(
                `Error accessing to the user database`
            )
            return
        }

        if (!isUpdated){
            res.status(500).send(
                `User with id: ${id} not updated - User not found or duplicated in database`
            )
            return
        }

        const passwordRecoveryEdit = {
            isUsed: true,
        }

        try{
            isUpdated = await databaseServiceUser.updatePasswordRecovery(passwordRecovery._id,passwordRecoveryEdit)
        } catch (error) {
            res.status(500).send(
                `Error accessing to the password recovery database`
            )
            return
        }

        res.status(200).send(
            `Successfully updated user with id ${id}`
        )

    }
)

usersRouterNew.get("/validate/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id
    try {
        let emailValidator;

        try {
            emailValidator = await databaseServiceUser.getEmailValidatorById(id)
        }
        catch (error) {
            console.error(error)
            res.status(500).send((error as Error).message)
            return
        }

        if (!emailValidator) {
            res.status(404).send(
                "Unable to find email associated with this link"
            )
            return
        }

        if (
            emailValidator.expirationDate < new Date() ||
            emailValidator.isUsed
        ) {
            res.status(401).send(
                "This link has expired or has been already used"
            )
            return
        }

        let user;

        try{
            user = await databaseServiceUser.getUserById(String(emailValidator.userId))
        }
        catch(error) {
            console.error(error)
            res.status(500).send((error as Error).message)
            return
        }

        if (!user) {
            res.status(500).send(
                "Unable to find user associated with this link"
            )
            return
        }

        const userEdit = {
            status: "validated",
        }
        let uniqueUserModified: Boolean;

        try {
            uniqueUserModified = await databaseServiceUser.updateUser(user._id,userEdit)
        } catch {
            res.status(500).send(
                "Error activating the user"
            )
            return
        }

    

        if (!uniqueUserModified) {
            res.status(500).send(
                "Error activating the user, either user doesot exist or is replicated in the database"
            )
            return
        }
        // Set the email validator as used
        const emailValidatorEdit = {
            isUsed: true,
        }

        try{
            databaseServiceUser.updateEmailValidator(id,emailValidatorEdit)
        } catch {
            res.status(500).send(
                "Error updating the email validator link status"
            )
            return
        }

        res.status(200).send(
            `Successfully validated user with link ${id}`
        )
        return
    } catch {
        res.status(404).send(
            `Unable to find matching document with id: ${req.params.id}`
        )
    }
})

/**
 * Route to create a new user
 */
usersRouterNew.post(
    "/",
    bodyJSONValidate(createUserSchema),
    async (req: Request, res: Response) => {
        try {
            let newUser = req.body as User

            // Verification of unicity of the email
            try {
                const user = await databaseServiceUser.getUserByEmail(newUser.email)
                if (user) {
                    res.status(400).send("Email or username already exists")
                    return
                }
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }


            
            // add the user to the database with status "created"
            newUser.password = await hashWithSalt(newUser.password)
            newUser = createDefaultAccount(newUser) 

            try {
                await databaseServiceUser.insertUser(newUser)
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }

            // generate a link to send to the user to confirm his email address

            const emailValidator = emailValidatorFactory(
                newUser.email,
                newUser._id
            )
            try {
                await databaseServiceUser.insertEmailValidator(emailValidator)
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }


            // send the link to the user by email
            let email_response = await sendValidationEmail(
                emailValidator.email,
                `${process.env.APP_URL}/users/validate/` +
                    emailValidator._id!.toString()
            )

            if (email_response.response.includes("OK")) {
                res.status(200).send(
                    `Successfully created a new user with id ${newUser._id}`
                )
                return
            } else {
                res.status(500).send("Failed to send validation email.")
                return
            }


        } catch (error) {
            console.error(error)
            res.status(400).send((error as Error).message)
        }
    }
)

usersRouterNew.post(
    "/login",
    bodyJSONValidate(loginSchema),
    async (req: Request, res: Response) => {
        console.log("POST /users/login")
        try {
            const { email, password } = req.body
            var user : User | null
            try {
                user = await databaseServiceUser.getUserByEmail(email)
                if (!user){
                    res.status(401).send("Unauthorized")
                        return
                }
    
                var comparisonResult: Boolean = await compareHash(
                    password,
                    user.password
                )
    
                // If password is incorrect, return 401
                if (!comparisonResult) {
                    res.status(401).send("Unauthorized")
                    return
                }
    
                res.status(200).send(generateToken(user))

            } catch {
                res.status(500).send("User database server error")

            } 

        } catch (error) {
            console.error(error)
            res.status(400).send((error as Error).message)
        }
    }
)

usersRouterNew.post(
    "/updatepassword/:id",
    AuthenticateCorrespondingId,
    bodyJSONValidate(userNewPasswordSchema),
    async (req: Request, res: Response) => {
        const id = req?.params?.id

        try {
            // Get the stored password
            let user;
            try {
                user = await databaseServiceUser.getUserById(id)
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }

            if (!user){
                res.status(404).send("User not foudn in the database")
                return
            }

            // Comparison of the passwords

            var isPreviousPassOk = await compareHash(
                req.body.previousPassword,
                user.password
            )

            if (!isPreviousPassOk) {
                res.status(401).send("Unauthorized")
                return
            }

            const userEdit = {
                password: await hashWithSalt(req.body.newPassword),
            }

            let isSuccess
            try{
                isSuccess = await databaseServiceUser.updateUser(id,userEdit)
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }


            if (isSuccess) {
                res.status(200).send(
                    `Successfully updated user with id ${id}`
                )
            } else {
                res.status(500).send(
                    `User with id: ${id} not updated - User not found or duplicated in database`
                )
            }

        } catch (error) {
            console.error((error as Error).message)
            res.status(400).send((error as Error).message)
        }
    }
)

// PUT

usersRouterNew.put(
    "/:id",
    AuthenticateCorrespondingId,
    bodyJSONValidate(generateSchemaMiddleware(UserPublicEdit)),
    async (req: Request, res: Response) => {
        const id = req?.params?.id

        try {
            const userEdit: UserPublicEdit = req.body as UserPublicEdit

            let isSuccess
            try{
                isSuccess = await databaseServiceUser.updateUser(id,userEdit)
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }

            isSuccess ? res.status(200).send(`Successfully updated user with id ${id}`)
                    : res.status(304).send(`User with id: ${id} not updated`)
            
        } catch (error) {
            console.error((error as Error).message)
            res.status(400).send((error as Error).message)
        }
    }
)

// DELETE
usersRouterNew.delete("/:id",AuthenticateCorrespondingId, async (req: Request, res: Response) => {
    const id = req?.params?.id

    try {
        let isSuccess
        try{
            isSuccess = await databaseServiceUser.deleteUser(id)
        } catch (error) {
            console.error(error)
            res.status(500).send((error as Error).message)
            return
        }

        isSuccess ? res.status(200).send(`Successfully deleted user with id ${id}`)
                : res.status(304).send(`User with id: ${id} not deleted`)

    } catch (error) {
        console.error((error as Error).message)
        res.status(400).send((error as Error).message)
    }
})

usersRouterNew.get(
    "/",
    AuthenticateAdmin,
    async (_req: Request, res: Response) => {
        try {
            let userList
            try {
                userList = await databaseServiceUser.getAllUsers()
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
                return
            }

            
            res.status(200).send(userList)
            
        } catch (error) {
            res.status(500).send((error as Error).message)
        }
    }
)
//