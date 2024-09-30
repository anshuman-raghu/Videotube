import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router()

router.route("/register").post(
    
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        }, 
        {
            name: 'coverImg',
            maxCount: 1
        },
    ]),
    (err, req, res, next)=>{
        if(err){
            console.log(err.message);
            console.log(err);      
            
        }
        next()
    },
    registerUser
)


export default router
