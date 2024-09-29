import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js' 
import { User } from '../models/user.model.js'
import {UploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'



const ragisterUser= asyncHandler(async(req,res)=>{
    //Get user details
    const {username,email,fullname,password} = req.body
    
    //validating the data
    if(
        [fullname,email,username,password].some((field)=> field?.trim==="")
    ){
        throw new apiError(400,"All fileds are required ")
    }

    //Checking if user exists
    const ExistingUser = User.findOne({
        $or:[{username},{email}]
    })

    if(ExistingUser){
        throw new apiError(409,"User With Username Or Email Already Exists")
    }
    //Checking Imgs
    const AvatarlocaFilePath= req.files?.avatar[0]?.path;
    const coverImglocaFilePath= req.files?.coverImg[0]?.path;

    console.log("Printing req.files", req.files)

    if(AvatarlocaFilePath){
        throw new apiError (400,"Avatar file is important")
    }

    //upload file on cloudinary
    const avatar = await UploadOnCloudinary(AvatarlocaFilePath)
    const coverImg= await UploadOnCloudinary(coverImglocaFilePath)

    if(!avatar){throw new apiError (400,"Avatar file is important")}


    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImg?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new apiError(500,"Somethings Went worng while Ragistering User")

    }

    return res.status(201).json(
        new apiResponse(200,createdUser,"User Registered Succesfully")
    )   
})

export {ragisterUser}
