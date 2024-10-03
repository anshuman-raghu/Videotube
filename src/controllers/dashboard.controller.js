import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params

    if((channelId.owner.toString() !== req.user._id.toString())){
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    const stats = await Video.aggregate([
        {
            $match:{
                owner: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id: null,
                totalViews: {$sum: "$views"},
                totalVideos: {$sum: 1}
            }
        },
    ])

    const totalSubscribers = await Subscription.countDocuments({
        channel:"channelId"
    })

    const totalLikes = await Like.countDocuments({
        video: {
            $in: await Video.find({
                owner: channelId
            }).select("_id")
        }
    })


    res.status(200).json(new ApiResponse(200, "Channel stats found", {
        totalViews: stats[0].totalViews,
        totalVideos: stats[0].totalVideos, 
        totalSubscribers,
        totalLikes
    }))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    
    const {channelId} = req.params

    const allVideos = await Video.find({owner: channelId})

    res.status(200).json(new ApiResponse(200, "Channel videos found", {allVideos}))
    
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }