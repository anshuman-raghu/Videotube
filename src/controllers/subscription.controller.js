import mongoose, { isValidObjectId } from "mongoose"
import {Subscription} from "../models/subscription.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res, next) => {
    const {channelId} = req.params
    const {userId} = req.user

    if(!isValidObjectId(channelId)){
        throw new apiError(400, "Invalid channel id")
    }

    const isSubscribed = await Subscription.findOne({
        $and: [
            {channel: channelId},
            {subscriber: userId}
        ]
    })

    if(isSubscribed){
        //issubscribed is true , so unsubscribe
        const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed._id)

        if(!unsubscribe){
            throw new apiError(400, "Unsubscription failed")
        }

        return res.status(200).json(new apiResponse(200, "Unsubscribed Succesfully"))
    }
    //if come here mean it is not subscribed
    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: userId
    })

    if(!newSubscription){
        throw new apiError(400, "Subscription not created")
    }
    res.status(201).json(new apiResponse(201, "Subscribed Succesfully",{newSubscription}))
})

const getUserChannelSubscribers = asyncHandler(async (req, res, next) => {
    //ese Subscription object jinke channel me is channel ki id ho
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new apiError(400, "Invalid channel id")
    }

    const subscribersList = await Subscription.aggrigate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"SubscriberDetials"
            },
        },
        {
            $unwind:{
                $SubscriberDetials
            }
        },
        {
            $project:{
                subscriberId:"$SubscriberDetials._id",
                subscriberName:"$SubscriberDetials.fullname",
                subscriberAvatar:"$SubscriberDetials.avatar"
            }
        }
    ])
    return res.status(200).json(new apiResponse(200, "Subscribers List ", {subscribersList}))
})
const getSubscribedChannels = asyncHandler(async (req, res, next) => {
    const {userId} = req.user

    const channelList = await Subscription.aggrigate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"ChannelDetials",
            },
        },
        {
            $unwind:"$ChannelDetials",
        },
        {
            $project:{
                channelId:"$ChannelDetials._id",
                channelName:"$ChannelDetials.fullname",
                channelAvatar:"$ChannelDetials.avatar"
            }
        },
    ])
    return res.status(200).json(new apiResponse(200, "Subscribed Channels", {channelList}))
})








export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}