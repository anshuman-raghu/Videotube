import mongoose, { isValidObjectId } from "mongoose"
import {Like} from "../models/like.model.js"
import {User} from "../models/user.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleCommentLike = asyncHandler(async (req, res, next) => {
    const {commentId} = req.params
    const {userId} = req.user

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const like = await Like.findOne({likeBy: userId, comment: commentId})

    if(like){
        await like.remove()
        return res.status(200).json(new ApiResponse(200, "Comment like removed"))
    }

    const newLike = await Like.create({
        likeBy: userId,
        comment: commentId
    })

    if(!newLike){
        throw new ApiError(400, "Comment like not created")
    }

    res.status(201).json(new ApiResponse(201, "Comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res, next) => {
    const {tweetId} = req.params
    const {userId} = req.user

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const like = await Like.findOne({likeBy: userId, tweet: tweetId})

    if(like){
        await like.remove()
        return res.status(200).json(new ApiResponse(200, "Tweet like removed"))
    }

    const newLike = await Like.create({
        likeBy: userId,
        tweet: tweetId
    })

    if(!newLike){
        throw new ApiError(400, "Tweet like not created")
    }

    res.status(201).json(new ApiResponse(201, "Tweet liked successfully"))
})

const toggleVideoLike = asyncHandler(async (req, res, next) => {
    const {videoId} = req.params
    const {userId} = req.user

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const like = await Like.findOne({likeBy: userId, video: videoId})

    if(like){
        await like.remove()
        return res.status(200).json(new ApiResponse(200, "Video like removed"))
    }

    const newLike = await Like.create({
        likeBy: userId,
        video: videoId
    })

    if(!newLike){
        throw new ApiError(400, "Video like not created")
    }

    res.status(201).json(new ApiResponse(201, "Video liked successfully"))
}
)
const getLikedVideos = asyncHandler(async (req, res, next) => {
    const {userId} = req.user

    const likedVideos = await Like.find({likeBy: userId, video: {$exists: true}}).populate("video")

    if(!likedVideos){
        throw new ApiError(404, "No liked videos found")
    }
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}