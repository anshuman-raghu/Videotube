import { Router } from "express";
import { loginUser,logoutUser, registerUser,refreshAccessToken,changePassword,currentUser,updateUserDetails,updateAvatar,updateCoverImg, getUserChannelProfile, getWatchHistory} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

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

router.route("/login").post(
    loginUser 
)

router.route("/logout").post(
    verifyJWT,
    logoutUser 
)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/changePassword").post(
    verifyJWT,
    upload.none(),
    changePassword
)
router.route("/currentUser").get(
    verifyJWT,
    currentUser
)

router.route("/updateUserDetails").patch(
    verifyJWT,
    upload.none(),
    updateUserDetails
)
router.route("/updateAvatar").post(
    verifyJWT,
    upload.single('avatar'),
    updateAvatar
)
router.route("/updateCoverImg").post(
    verifyJWT,
    upload.single('coverImg'),
    updateCoverImg
)

router.route("/c/:username").get(
    verifyJWT,getUserChannelProfile
)

router.route("/history").get(
    verifyJWT,getWatchHistory
)

export default router
