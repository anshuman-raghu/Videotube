import { Router } from "express";
import { ragisterUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImg",
            maxCount:1
        }
    ]),
    ragisterUser
)



export default router
