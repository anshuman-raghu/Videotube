import mongoose,{isValidObjectId} from "mongoose";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const video = await Video.aggregatePaginate([
        {
            $match: {
                $or:[
                    {
                        title:{
                            $regex:query,
                            $options:"i"
                        }
                    },
                    {
                        discription:{
                            $regex:query,
                            $options:"i"
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project:{
                thumbnail:1,
                title:1,
                discription:1,
                videoFile:1,
                owner:{
                    fullname:1,
                    avatar:1,
                    username:1
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        }
    ])
})

const publishAVideo = asyncHandler(async (req, res, next) => {
    const{title, discription} = req.body

    if(!title || !discription){
        throw apiError(400, "Title and discription are required")
    }

    const videoFileLocalPath = req?.files?.videoFile[0]?.path
    if(!videoFileLocalPath){
        throw apiError(400, "Video file is required")
    }

    const videoFile = await UploadOnCloudinary(videoFileLocalPath)

    if(!videoFile.url){
        throw apiError(500, "Failed to upload video file")
    }

    const thumbnailLocalPath = req?.files?.thumbnail[0]?.path

    if(!thumbnailLocalPath){
        throw apiError(400, "Thumbnail is required")
    }

    const thumbnail = await UploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw apiError(500, "Failed to upload thumbnail")
    }

    const savedVideo = await Video.create({
        title,
        discription,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration,
        owner:req.user._id
    })

    if(!savedVideo){
        throw apiError(500, "Failed to save video")
    }

    return res.status(201).json(new apiResponse(201, "Video Uploded successfully", {savedVideo}))
})

const getVideoById = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid video id")
    }

    const video = await Video.findById(id).populate("owner", "fullname avatar username")
    video.views += 1
    if(!video){
        throw apiError(404, "Video not found")
    }

    return res.status(200).json(new apiResponse(200, "Video found", {video}))
})

const updateVideo = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid video id")
    }

    const video = await Video.findById(id)

    if(!video){
        throw apiError(404, "Video not found")
    }

    if(!((video.owner).equals(req.user._id))){
        throw apiError(403, "You are not authorized to update this video")
    }

    const newThumbnailpath = req?.file?.path
    if(!newThumbnailpath){
        throw apiError(400, "Thumbnail is required")
    }

    const newThumbnail = await UploadOnCloudinary(newThumbnailpath)

    if(!newThumbnail.url){
        throw apiError(500, "Failed to upload thumbnail")
    }

    try {
        await deleteOnCloudinary(video.thumbnail)
    } catch (error) {
        throw apiError(500, "Failed to delete old thumbnail")
    }

    const {title, discription} = req.body
    const updatedVideo = await Video.findByIdAndUpdate(
        id,
        {
            $set:{
                title,
                discription,
                thumbnail:newThumbnail.url
            },
        },
        {
            new:true
        }
    )
    res.status(200).json(new apiResponse(200, "Video details updated successfully", {updatedVideo}))    
})

const deleteVideo = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid video id")
    }

    const video = await Video.findById(id)

    if(!video){
        throw apiError(404, "Video not found")
    }

    if(!((video.owner).equals(req.user._id))){
        throw apiError(403, "You are not authorized to delete this video")
    }

    try {
        await deleteOnCloudinary(video.thumbnail)
        await deleteOnCloudinary(video.videoFile)
    } catch (error) {
        throw apiError(500, "Failed to delete video files")
    }

    const deletedVideo = await Video.findByIdAndDelete(id)


    res.status(200).json(new apiResponse(200,{deletedVideo}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid video id")
    }

    const video = await Video.findById(id)

    if(!video){
        throw apiError(404, "Video not found")
    }
    if(!((video.owner).equals(req.user._id))){
        throw apiError(403, "You are not authorized to update this video")
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        id,
        {
            $set:{
                isPublished:!video.isPublished
            }
        },
        {
            new:true
        }
    )
    res.status(200).json(new apiResponse(200, "Video publish status updated successfully", {updatedVideo}))
})




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}