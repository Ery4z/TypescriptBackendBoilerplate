import express from "express"
import { connectToDatabase } from "./services/database.service"
import { usersRouter } from "./routes/users.router"
import { Application } from "express"
import path from "path"

const app: Application = express()
const port = 3000

//? Set the view engine to ejs to render the recover password page and email template
app.set("views", path.resolve("views"))
app.set("view engine", "ejs")

app.use(express.json())
app.use("/public", express.static(path.resolve("public")))

app.get("/", async (_req, res) => {
    res.status(200).send("Hello World!")
})

//app.use("/users", usersRouter)
app.use("/users",usersRouter)

connectToDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`)
        })
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error)
        throw error
    })
