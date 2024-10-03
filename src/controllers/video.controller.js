import mongoose,{isValidObjectId} from "mongoose";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const vedio = await Video.aggregatePaginate([
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
                vedioFile:1,
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

    const vedioFileLocalPath = req?.files?.vedioFile[0]?.path
    if(!vedioFileLocalPath){
        throw apiError(400, "Vedio file is required")
    }

    const vedioFile = await UploadOnCloudinary(vedioFileLocalPath)

    if(!vedioFile.url){
        throw apiError(500, "Failed to upload vedio file")
    }

    const thumbnailLocalPath = req?.files?.thumbnail[0]?.path

    if(!thumbnailLocalPath){
        throw apiError(400, "Thumbnail is required")
    }

    const thumbnail = await UploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw apiError(500, "Failed to upload thumbnail")
    }

    const savedVedio = await Video.create({
        title,
        discription,
        vedioFile:vedioFile.url,
        thumbnail:thumbnail.url,
        duration:vedioFile.duration,
        owner:req.user._id
    })

    if(!savedVedio){
        throw apiError(500, "Failed to save vedio")
    }

    return res.status(201).json(new apiResponse(201, "Vedio Uploded successfully", {savedVedio}))
})

const getVideoById = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid vedio id")
    }

    const vedio = await Video.findById(id).populate("owner", "fullname avatar username")
    
    if(!vedio){
        throw apiError(404, "Vedio not found")
    }

    return res.status(200).json(new apiResponse(200, "Vedio found", {vedio}))
})

const updateVideo = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid vedio id")
    }

    const vedio = await Video.findById(id)

    if(!vedio){
        throw apiError(404, "Vedio not found")
    }

    if(!((vedio.owner).equals(req.user._id))){
        throw apiError(403, "You are not authorized to update this vedio")
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
        await deleteOnCloudinary(vedio.thumbnail)
    } catch (error) {
        throw apiError(500, "Failed to delete old thumbnail")
    }

    const {title, discription} = req.body
    const updatedVedio = await Video.findByIdAndUpdate(
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
    res.status(200).json(new apiResponse(200, "Vedio details updated successfully", {updatedVedio}))    
})

const deleteVideo = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid vedio id")
    }

    const vedio = await Video.findById(id)

    if(!vedio){
        throw apiError(404, "Vedio not found")
    }

    if(!((vedio.owner).equals(req.user._id))){
        throw apiError(403, "You are not authorized to delete this vedio")
    }

    try {
        await deleteOnCloudinary(vedio.thumbnail)
        await deleteOnCloudinary(vedio.vedioFile)
    } catch (error) {
        throw apiError(500, "Failed to delete vedio files")
    }

    const deletedVedio = await Video.findByIdAndDelete(id)


    res.status(200).json(new apiResponse(200,{deletedVedio}, "Vedio deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    if(!isValidObjectId(id)){
        throw apiError(400, "Invalid vedio id")
    }

    const vedio = await Video.findById(id)

    if(!vedio){
        throw apiError(404, "Vedio not found")
    }
    if(!((vedio.owner).equals(req.user._id))){
        throw apiError(403, "You are not authorized to update this vedio")
    }
    const updatedVedio = await Video.findByIdAndUpdate(
        id,
        {
            $set:{
                isPublished:!vedio.isPublished
            }
        },
        {
            new:true
        }
    )
    res.status(200).json(new apiResponse(200, "Vedio publish status updated successfully", {updatedVedio}))
})




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}