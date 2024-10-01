import { jwt } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import {apiError} from "../utils/apiError"



export const verifyJwt = asyncHandler(async(req,res, next)=>{
    try {
        const Token = req.cookie?.accessToken || req.header(Authorization)?.replace("Bearer ","")
         
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshtoken")
    
        if (!user) {
            throw new apiError(405,"Invalid Access Token")        
        }
        
        req.user = user

        next()

    } catch (error) {
        throw new apiError(401, error?.message || "Invacli acces token")
    }     
})