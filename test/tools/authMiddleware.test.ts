// Mocking the environment variable for JWT_SECRET_KEY
process.env.JWT_SECRET_KEY = "mockedSecretKey"

import { Authenticate, AuthenticateAdmin } from "../../src/tools/authMiddleware"
import { NextFunction, Request, Response } from "express" // Assuming Express types
import { verifyToken } from "../../src/tools/jwt" // Adjust path accordingly
import { mock } from "node:test"

jest.mock("../../src/tools/jwt", () => ({
    verifyToken: jest.fn(),
}))

jest.mock("dotenv", () => ({
    config: jest.fn(),
}))

describe("Authenticate Decorator", () => {
    let mockReq: Partial<Request> & { headers: { [key: string]: string } }
    let mockRes: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
        mockReq = {
            headers: {},
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        }
        mockNext = jest.fn()
    })

    it("should respond with 401 if no authorization header is present", () => {
        Authenticate(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 for invalid token format", () => {
        mockReq.headers.authorization = "Bearer"
        Authenticate(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if verifyToken returns undefined", () => {
        ;(verifyToken as jest.Mock).mockReturnValue(undefined)
        mockReq.headers.authorization = "Bearer someToken"
        Authenticate(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("someToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if verifyToken throws an error", () => {
        ;(verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error("Verification failed")
        })
        mockReq.headers.authorization = "Bearer someToken"
        Authenticate(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("someToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if token is expired", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            adm: false,
            exp: 0,
        })
        mockReq.headers.authorization = "Bearer invalidToken"
        Authenticate(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("invalidToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should call original method for valid scenarios", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            exp: 9999999999999,
        })
        mockReq.headers.authorization = "Bearer validToken"
        Authenticate(mockReq as Request, mockRes as Response, mockNext)

        // Here, you'd want to verify that the "next" function is called as the current implementation doesn't have "wasDummyMethodCalled"
        expect(mockNext).toHaveBeenCalled()
    })
})

describe("Authenticate Decorator Admin", () => {
    let mockReq: Partial<Request> & { headers: { [key: string]: string } }
    let mockRes: Partial<Response>
    let mockNext: NextFunction
    let wasDummyMethodCalled: boolean

    beforeEach(() => {
        // Reset the dummy method call flag for each test
        wasDummyMethodCalled = false

        mockReq = {
            headers: {},
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        }
        mockNext = jest.fn()
    })

    it("should respond with 401 if no authorization header is present", () => {
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 for invalid token format", () => {
        mockReq.headers.authorization = "Bearer"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if verifyToken returns undefined", () => {
        ;(verifyToken as jest.Mock).mockReturnValue(undefined)
        mockReq.headers.authorization = "Bearer someToken"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("someToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if verifyToken throws an error", () => {
        ;(verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error("Verification failed")
        })
        mockReq.headers.authorization = "Bearer someToken"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("someToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if the user is not an admin", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            adm: false,
            exp: 9999999999999,
        })
        mockReq.headers.authorization = "Bearer invalidToken"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("invalidToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if token is expired", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            adm: false,
            exp: 0,
        })
        mockReq.headers.authorization = "Bearer invalidToken"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("invalidToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should call original method for valid scenarios", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            adm: true,
            exp: 9999999999999,
        })
        mockReq.headers.authorization = "Bearer validToken"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        // Here, you'd want to verify that the "next" function is called as the current implementation doesn't have "wasDummyMethodCalled"
        expect(mockNext).toHaveBeenCalled()
    })
})

describe("Authenticate Decorator Id", () => {
    let mockReq: Partial<Request> & { headers: { [key: string]: string } }
    let mockRes: Partial<Response>
    let mockNext: NextFunction
    let wasDummyMethodCalled: boolean

    beforeEach(() => {
        // Reset the dummy method call flag for each test
        wasDummyMethodCalled = false

        mockReq = {
            headers: {},
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        }
        mockNext = jest.fn()
    })

    it("should respond with 401 if no authorization header is present", () => {
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 for invalid token format", () => {
        mockReq.headers.authorization = "Bearer"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if verifyToken returns undefined", () => {
        ;(verifyToken as jest.Mock).mockReturnValue(undefined)
        mockReq.headers.authorization = "Bearer someToken"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("someToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if verifyToken throws an error", () => {
        ;(verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error("Verification failed")
        })
        mockReq.headers.authorization = "Bearer someToken"
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("someToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if the user id does not correspond with id params", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            adm: false,
            exp: 9999999999999,
        })
        mockReq.headers.authorization = "Bearer invalidToken"
        mockReq.params = { id: "54321" }
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("invalidToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should respond with 401 if token is expired", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            adm: false,
            exp: 0,
        })
        mockReq.headers.authorization = "Bearer invalidToken"
        mockReq.params = { id: "12345" }
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(verifyToken).toHaveBeenCalledWith("invalidToken")
        expect(mockRes.send).toHaveBeenCalledWith("Unauthorized")
    })

    it("should call original method for valid scenarios", () => {
        ;(verifyToken as jest.Mock).mockReturnValue({
            userId: "12345",
            role: "user",
            adm: true,
            exp: 9999999999999,
        })
        mockReq.headers.authorization = "Bearer validToken"
        mockReq.params = { id: "12345" }
        AuthenticateAdmin(mockReq as Request, mockRes as Response, mockNext)

        // Here, you'd want to verify that the "next" function is called as the current implementation doesn't have "wasDummyMethodCalled"
        expect(mockNext).toHaveBeenCalled()
    })
})
