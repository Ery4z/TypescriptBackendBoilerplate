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

//TODO: Port this
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
            const query = { _id: new ObjectId(id) }
            if (collections && collections.users) {
                const user = (await collections.users.findOne(
                    query
                )) as unknown as User

                if (user) {
                    res.status(200).send(user)
                }
            }
        } catch (error) {
            res.status(404).send(
                `Unable to find matching document with id: ${req.params.id}`
            )
        }
    }
)
//TODO: Port this

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
            const query = { email: email }
            if (
                collections &&
                collections.users &&
                collections.passwordRecoveries
            ) {
                const user = (await collections.users.findOne(
                    query
                )) as unknown as User

                if (user) {
                    // Generate a recovery password object and store it in the database
                    const passwordRecovery = passwordRecoveryFactory(user._id!)

                    await collections.passwordRecoveries.insertOne(
                        passwordRecovery
                    )

                    //! Todo Create a route
                    // Send the recovery link to the user by email
                    let email_response = await sendPasswordRecoveryEmail(
                        user.email,
                        `${process.env.APP_URL}/users/recoverpassword/` +
                            passwordRecovery._id!.toString()
                    )
                }

                res.status(200).send(
                    "An email has been sent to the email address if it exists in our database"
                )
            } else {
                res.status(500).send("Database connection error")
            }
        } catch (error) {
            res.status(500).send(
                "An error occured while trying to recover the password"
            )
        }
    }
)
//TODO: Port this

usersRouterNew.get("/recoverpassword/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id
    res.render("recoverPassword.ejs", {
        url: `${process.env.APP_URL}/users/recoverpassword/` + id,
    })
})
//TODO: Port this

usersRouterNew.post(
    "/recoverpassword/:id",
    bodyJSONValidate(recoverPasswordSchema),
    async (req: Request, res: Response) => {
        const id = req?.params?.id
        try {
            const query = { _id: new ObjectId(id) }
            if (
                collections &&
                collections.passwordRecoveries &&
                collections.users
            ) {
                const passwordRecovery =
                    (await collections.passwordRecoveries.findOne(
                        query
                    )) as unknown as PasswordRecovery

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

                // Get the user associated with the password recovery link
                const userQuery = { _id: passwordRecovery.userId }
                const user = (await collections.users.findOne(
                    userQuery
                )) as unknown as User

                if (!user) {
                    res.status(404).send("User not found")
                    return
                }

                // Update the user password

                const userEdit = {
                    password: await hashWithSalt(req.body.newPassword),
                }

                const result = await collections.users.updateOne(userQuery, {
                    $set: userEdit,
                })

                if (result.modifiedCount == 1) {
                    // Set the password recovery link as used
                    const passwordRecoveryEdit = {
                        isUsed: true,
                    }

                    await collections.passwordRecoveries.updateOne(query, {
                        $set: passwordRecoveryEdit,
                    })

                    res.status(200).send(
                        `Successfully updated user with id ${id}`
                    )
                    return
                }

                res.status(500).send(
                    `User with id: ${id} not updated - User not found or duplicated in database`
                )

                return
            }
        } catch (error) {
            res.status(404).send(
                `Unable to find matching document with id: ${req.params.id}`
            )
        }
    }
)
//TODO: Verify this port 

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
            }


            
            // add the user to the database with status "created"
            newUser.password = await hashWithSalt(newUser.password)
            newUser = createDefaultAccount(newUser) 

            try {
                await databaseServiceUser.insertUser(newUser)
            } catch (error) {
                console.error(error)
                res.status(500).send((error as Error).message)
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
            } else {
                res.status(500).send("Failed to send validation email.")
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
//TODO: Port this

usersRouterNew.post(
    "/updatepassword/:id",
    AuthenticateCorrespondingId,
    bodyJSONValidate(userNewPasswordSchema),
    async (req: Request, res: Response) => {
        const id = req?.params?.id

        try {
            // Get the stored password

            const query = { _id: new ObjectId(id) }
            if (collections && collections.users) {
                const user = (await collections.users.findOne(
                    query
                )) as unknown as User

                if (user) {
                    // Compare the stored password with the previous password
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

                    const result = await collections.users.updateOne(query, {
                        $set: userEdit,
                    })

                    if (result.modifiedCount == 1) {
                        res.status(200).send(
                            `Successfully updated user with id ${id}`
                        )
                    } else {
                        res.status(500).send(
                            `User with id: ${id} not updated - User not found or duplicated in database`
                        )
                    }
                    return
                }
            } else {
                res.status(500).send("User database server error")
            }
        } catch (error) {
            console.error((error as Error).message)
            res.status(400).send((error as Error).message)
        }
    }
)

// PUT
//TODO: Port this

usersRouterNew.put(
    "/:id",
    AuthenticateCorrespondingId,
    bodyJSONValidate(generateSchemaMiddleware(UserPublicEdit)),
    async (req: Request, res: Response) => {
        const id = req?.params?.id

        try {
            const userEdit: UserPublicEdit = req.body as UserPublicEdit
            const query = { _id: new ObjectId(id) }
            if (collections && collections.users) {
                const result = await collections.users.updateOne(query, {
                    $set: userEdit,
                })

                result
                    ? res
                          .status(200)
                          .send(`Successfully updated user with id ${id}`)
                    : res.status(304).send(`User with id: ${id} not updated`)
            }
        } catch (error) {
            console.error((error as Error).message)
            res.status(400).send((error as Error).message)
        }
    }
)
//TODO: Port this

// DELETE
usersRouterNew.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id

    try {
        const query = { _id: new ObjectId(id) }
        if (collections && collections.users) {
            const result = await collections.users.updateOne(query, {
                $set: { status: "deleted" },
            })

            result
                ? res
                      .status(200)
                      .send(`Successfully deleted user with id ${id}`)
                : res.status(304).send(`User with id: ${id} not deleted`)
        }
    } catch (error) {
        console.error((error as Error).message)
        res.status(400).send((error as Error).message)
    }
})
//TODO: Port this

usersRouterNew.get(
    "/",
    AuthenticateAdmin,
    async (_req: Request, res: Response) => {
        try {
            if (collections && collections.users) {
                const users = (await collections.users
                    .find({})
                    .toArray()) as unknown as User[]
                res.status(200).send(users)
            }
        } catch (error) {
            res.status(500).send((error as Error).message)
        }
    }
)
//