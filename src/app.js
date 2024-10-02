import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import multer from 'multer';

const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credential: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//Multer middleware
const upload = multer();

//Routes imports
import userRoutes from "./routes/user.routes.js"

// Router Declaration 
app.use("/api/v1/users", userRoutes)



export default app
