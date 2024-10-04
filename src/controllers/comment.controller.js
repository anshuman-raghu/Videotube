import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"





const getVideoComments = asyncHandler(async (req, res, next) => {
    const {videoId} = req.params

    const comments = await Comment.find({video: videoId}).populate("owner")

    if(!comments){
        throw new apiError(404, "No comments found")
    }

    res.status(200).json(new apiResponse(200, "Comments found", {comments}))
})



const addComment = asyncHandler(async (req, res, next) => {
    const {videoId} = req.params
    const userId = req.user._id.toString()
    const {content} = req.body
    
    const video = await Video.findById(videoId)

    if(!(videoId || userId || content)){
        throw new apiError(404, "ALL fields are required")
    }

    const comment = await Comment.create({
        content,
        user: userId,
        video: videoId,
        owner: userId
    })

    if(!comment){
        throw new apiError(400, "Comment not created")
    }

    res.status(201).json(new apiResponse(201, "Comment created successfully", {comment}))
})

const updateComment = asyncHandler(async (req, res, next) => {
    const {commentId} = req.params
    const userId = req.user._id.toString()
    const {content} = req.body

    const comment = await Comment.findById(commentId)
    
    if(comment.owner.toString() !== userId){
        throw new apiError(403, "You are not authorized to perform this action")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {content}, {new: true})

    if(!updatedComment){
        throw new apiError(400, "Comment not updated")
    }

    res.status(200).json(new apiResponse(200, "Comment updated successfully", {updatedComment}))
})

const deleteComment = asyncHandler(async (req, res, next) => {
    const {commentId} = req.params
    const {userId} = req.user

    const comment = await Comment.findById(commentId)

   
    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new apiError(400, "Comment not deleted")
    }

    res.status(200).json(new apiResponse(200, "Comment deleted successfully", {deletedComment}))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }