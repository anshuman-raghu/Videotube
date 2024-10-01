import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js' 
import { User } from '../models/user.model.js'
import {UploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async(userId)=>{

    try {
        const user = await User.findById(userId)

        const refreshToken = user.genrateRefreshToken()
        const accessToken = user.genrateAccessToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        console.log(error);
        
        throw new apiError(501, "Somthing wrong while genrating Tokens")

    }
    

}

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
}
)

const loginUser = asyncHandler(async(req,res)=>{
    // get data from req body
    const {email, username, password} = req.body

    if(!username && !email)
    {
        throw new apiError(401,"Username or Email is required")

    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new apiError(405,"User Does not Exist Please ragister first")       
    }

    const IsValidPassword = await user.isPasswordCorrect(password)

    if(!IsValidPassword){
        throw new apiError(402,"Password Wrong")
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser =  await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(202).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options ).json(
        new apiResponse(
            202,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User Logged in Successfully"
        )
    );
}
)

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken: undefined
            }
        },
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(203).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new apiResponse(203,"Logout Succesfully"))

}
)


const refreshAccessToken = asyncHandler(async(req,res)=>{
    console.log(req.cookies);
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user = await  User.findById(decodedToken?._id)

    if(!user){
        throw new apiError(404,"Invalid Refresh token token")
    }

    if(user?.refreshToken == incomingRefreshToken)
    {
        const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)
  
        const options = {
            httpOnly: true,
            secure: true
        }
    
        res.status(202).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options ).json(
            new apiResponse(
                202,
                {
                    accessToken,refreshToken
                },
                "Access token refreshed "
            )
        );
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}

