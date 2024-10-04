import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/Subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    const channel = await User.findById(channelId)
    
    if((channel._id.toString() !== req.user._id.toString()))
    {
        throw new apiError(403, "You are not authorized to perform this action")
    }

    const stats = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId)
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
        channel: channel._id
    })

    const totalLikes = await Like.countDocuments({
        video: {
            $in: await Video.find({
                owner: channelId
            }).select("_id")
        }
    })


    res.status(200).json(new apiResponse(200, "Channel stats found", {
        totalViews: stats[0].totalViews,
        totalVideos: stats[0].totalVideos, 
        totalSubscribers,
        totalLikes
    }))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    
    const {channelId} = req.params

    const allVideos = await Video.find({owner: channelId})

    res.status(200).json(new apiResponse(200, "Channel videos found", {allVideos}))
    
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }