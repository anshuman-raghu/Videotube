import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {apiError} from "../utils/apiError.js"



export const verifyJwt = asyncHandler(async(req,res, next)=>{
    try {
        
        const Token = req.cookies?.accessToken || req.headers['Authorization']?.replace("Bearer ","")
        
        if(!Token){
            throw new apiError(404,"User must be login")
        }
        
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