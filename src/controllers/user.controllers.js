import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js' 
import { User } from '../models/user.model.js'
import {UploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import { json } from 'express'
import mongoose from 'mongoose'

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

    
    if(!req.files?.avatar){
        throw new apiError(400,"Avatar file is required Please Provide it")
    }
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
            $unset : {
                refreshToken: 1
            }
        },
        {
            new: true  
        }
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


const changePassword = asyncHandler(async(req,res)=>{

    console.log(req.user);
    console.log(req.body);

    
    
    const {oldPassword,newPassword} = req.body

    if(!oldPassword || !newPassword){
        throw new apiError(400,"Old Password and New Password is Required....")
    }

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new apiError(401,"Old Password is Wrong")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new apiResponse(200,"Password Changed Successfully"))
})

const currentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new apiResponse(200,req.user,"User Data"))
})

const updateUserDetails = asyncHandler(async(req,res)=>{

    const {fullname, email} = req.body
    console.log(req.body);
    
    
    if(!fullname || !email){
        throw new apiError(400,"Fullname and Email is Required")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
            fullname,
            email
            } 
        },
        {new:true}
    ).select("-password -refreshToken")


    return res.status(200).json(new apiResponse(200,user,"User Details Updated Successfully"))
}
)

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarlocaFilePath = req.file?.path
    if(!avatarlocaFilePath){
        throw new apiError(400,"Avatar file is required")
    }

    const avatar = await UploadOnCloudinary(avatarlocaFilePath)

    if(!avatar.url){
        throw new apiError(500,"File unable to upload")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")
    return res.status(200).json(new apiResponse(200,user,"Avatar Updated Successfully"))
})

const updateCoverImg = asyncHandler(async(req,res)=>{
    const coverImglocaFilePath = req.file?.path

    if(!coverImglocaFilePath){
        throw new apiError(400,"Cover Image file is required")
    }

    const coverImg = await UploadOnCloudinary(coverImglocaFilePath)

    if(!coverImg.url){
        throw new apiError(500,"File unable to upload")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImg: coverImg.url
            }
        }, 
        {new:true}
    ).select("-password")
    return res.status(200).json(new apiResponse(200,user,"Cover Image Updated Successfully"))
})


const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new apiError(400,"Username is required")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
             }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                subscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname:1,
                username:1,
                subscriberCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImg: 1,
                email: 1,
            }
        }


    ])

    if(!channel?.length){
        throw new apiError(404,"Channel Does not found ")   
    }

    return res.status(200).json(
        new apiResponse(200,channel[0],"Channel details fetched succesfully")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=> {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $arrayElemAt: ["$owner", 0]
                            }
                        }
                    }
                ]
            }
        },
    ])

    return res.status(200).json(
        new apiResponse(200,user[0].watchHistory,"Watch History Fetched succesfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    currentUser,
    updateUserDetails,
    updateAvatar,
    updateCoverImg,
    getUserChannelProfile,
    getWatchHistory

}

