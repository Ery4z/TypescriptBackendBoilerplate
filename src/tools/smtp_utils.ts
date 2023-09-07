// import nodemailer from "nodemailer"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import ejs from "ejs"
// Load environment variables
dotenv.config()

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com"
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587")
const SMTP_USERNAME = process.env.SMTP_USERNAME || ""
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || ""
const SMTP_FROM_ADDRESS = process.env.SMTP_FROM_ADDRESS || ""
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "No Reply"

let IS_SMTP_SECURE = false
if (SMTP_PORT === 465) {
    IS_SMTP_SECURE = true
}
let REQUIRE_TLS = false
if (SMTP_PORT === 587) {
    REQUIRE_TLS = true
}

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: IS_SMTP_SECURE,
    requireTLS: REQUIRE_TLS,
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
    },
    logger: false,
})

async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string
) {
    const infoPromise = transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_ADDRESS}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
        headers: { "x-myheader": "test header" },
    })
    return infoPromise
}

async function sendValidationEmail(to: string, validationLink: string) {
    const subject = "Email Validation"
    const text = `Please click on the following link to validate your email: ${validationLink}`

    // Path to your EJS template
    const templatePath = path.resolve("views", "emailVerification.ejs")
    const template = fs.readFileSync(templatePath, "utf-8")

    const html = ejs.render(template, { validationLink })

    return sendEmail(to, subject, text, html)
}

async function sendPasswordRecoveryEmail(to: string, recoveryLink: string) {
    const subject = "Password Recovery"
    const text = `Please click on the following link to recover your password: ${recoveryLink}`

    const templatePath = path.resolve("views", "emailPasswordRecovery.ejs")
    const template = fs.readFileSync(templatePath, "utf-8")

    const html = ejs.render(template, { recoveryLink })

    return sendEmail(to, subject, text, html)
}

export { sendEmail, sendValidationEmail, sendPasswordRecoveryEmail }
