import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js' 
import { User } from '../models/user.model.js'
import {UploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'



const registerUser= asyncHandler(async(req,res)=>{
    //Get user details
    
    const {username,email,fullname,password} = req.body;

    //validating the data
    if(
        [username,email,fullname,password].some((field)=> field?.trim() === ("" || undefined))
    ){
        throw new apiError(400,"All fields are required ");
    }

    //Checking if user exists
    const ExistingUser = await User.findOne({
        $or:[{username},{email}]
    });

    if(ExistingUser){
        throw new apiError(409,"User With Username Or Email Already Exists");
    }
    //Checking Imgs

    
    const avatarlocaFilePath= req.files?.avatar[0]?.path;
    if(!avatarlocaFilePath){
        throw new apiError (400,"avatar file is important Please Provide it")
    }

    const avatarC = await UploadOnCloudinary(avatarlocaFilePath)

    let coverImglocaFilePath
    let coverImg
    if(req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0){
        coverImglocaFilePath=req.files.coverImg[0].path;
        coverImg = await UploadOnCloudinary(coverImglocaFilePath);
    }

    
    if(!avatarC){throw new apiError (500,"File unable to upload ")}


    const user = await User.create({
        fullname,
        avatar:avatarC.url,
        coverImg:coverImg?.url || "",
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

export {registerUser}
