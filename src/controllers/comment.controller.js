import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"





const getVideoComments = asyncHandler(async (req, res, next) => {
    const {videoId} = req.params

    const comments = await Comment.find({video: videoId}).populate("user")

    if(!comments){
        throw new ApiError(404, "No comments found")
    }

    res.status(200).json(new ApiResponse(200, "Comments found", {comments}))
})



const addComment = asyncHandler(async (req, res, next) => {
    const {videoId} = req.params
    const {userId} = req.user
    const {content} = req.body

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        user: userId,
        video: videoId
    })

    if(!comment){
        throw new ApiError(400, "Comment not created")
    }

    res.status(201).json(new ApiResponse(201, "Comment created successfully", {comment}))
})

const updateComment = asyncHandler(async (req, res, next) => {
    const {commentId} = req.params
    const {userId} = req.user
    const {content} = req.body

    const comment = await Comment.findById(commentId)

    if(comment.user.toString() !== userId.toString()){
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {content}, {new: true})

    if(!updatedComment){
        throw new ApiError(400, "Comment not updated")
    }

    res.status(200).json(new ApiResponse(200, "Comment updated successfully", {updatedComment}))
})

const deleteComment = asyncHandler(async (req, res, next) => {
    const {commentId} = req.params
    const {userId} = req.user

    const comment = await Comment.findById(commentId)

    if(comment.user.toString() !== userId.toString()){
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(400, "Comment not deleted")
    }

    res.status(200).json(new ApiResponse(200, "Comment deleted successfully", {deletedComment}))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }