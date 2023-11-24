// Mocking the environment variable for JWT_SECRET_KEY
process.env.JWT_SECRET_KEY = "mockedSecretKey"
const { generateToken, verifyToken } = require("../../src/tools/jwt")
// import { generateToken, verifyToken } from "../../src/tools/jwt" // Adjust path accordingly
import jwt from "jsonwebtoken"
import { User } from "../../src/models/users"

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}))

jest.mock("dotenv", () => ({
    config: jest.fn(),
}))

describe("Token Functions", () => {
    afterEach(() => {
        jest.clearAllMocks()
        jest.resetModules() // This resets any cached modules
        delete process.env.JWT_SECRET_KEY
    })

    describe("generateToken", () => {
        it("should throw an error if JWT_SECRET_KEY is not defined", () => {
            delete process.env.JWT_SECRET_KEY
            process.env.JWT_DURATION = "3600"

            expect(() => generateToken({} as any)).toThrow(
                "JWT_SECRET_KEY is not defined"
            )
        })

        it("should throw an error if JWT_DURATION is not defined", () => {
            process.env.JWT_SECRET_KEY = "test_secret_key"
            delete process.env.JWT_DURATION

            expect(() => generateToken({} as any)).toThrow(
                "JWT_DURATION is not defined"
            )
        })

        it("should generate a token for valid user", () => {
            process.env.JWT_SECRET_KEY = "test_secret_key"
            process.env.JWT_DURATION = "2 days"
            const mockUser = {
                _id: "12345",
                userName: "testUser",
                isAdmin: false,
            }

            const mockToken = "mock_token"
            ;(jwt.sign as jest.Mock).mockReturnValue(mockToken)

            const token = generateToken(mockUser as unknown as User)

            expect(token).toEqual(mockToken)
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    _id: mockUser._id.toString(),
                    name: mockUser.userName,
                    adm: mockUser.isAdmin,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "2 days" }
            )
        })
    })

    describe("verifyToken", () => {
        it("should throw an error if JWT_SECRET_KEY is not defined", () => {
            delete process.env.JWT_SECRET_KEY

            expect(() => verifyToken("test_token")).toThrow(
                "JWT_SECRET_KEY is not defined"
            )
        })

        it("should verify a token", () => {
            process.env.JWT_SECRET_KEY = "test_secret_key"

            const mockPayload = { name: "testUser", adm: false }

            ;(jwt.verify as jest.Mock).mockReturnValue(mockPayload)

            const result = verifyToken("test_token")

            expect(result).toEqual(mockPayload)
            expect(jwt.verify).toHaveBeenCalledWith(
                "test_token",
                process.env.JWT_SECRET_KEY
            )
        })
    })
})
