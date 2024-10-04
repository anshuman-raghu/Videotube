import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res, next) => {
    const {content} = req.body
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
    if(!tweet){
        throw new apiError(400, "Tweet not created")
    }

    res.status(201).json(new apiResponse("Tweet created", tweet))
}
)

const getUserTweets = asyncHandler(async (req, res, next) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new apiError(400, "Invalid user id")
    }
    const tweets = await Tweet.find({owner: userId})
    if(!tweets.length){
        throw new apiError(404, "No tweets found")
    }

    res.status(200).json(new apiResponse(200,"Tweets found", {tweets}))
})
const updateTweet = asyncHandler(async (req, res, next) => {
    const {tweetId} = req.params
    const {content} = req.body
    
    if(!isValidObjectId(tweetId)){
        throw new apiError(400, "Invalid tweet id")
    }
    if(!content){
        throw new apiError(400, "Content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!((tweet.owner).equals(req.user._id))){
        throw new apiError(403, "You are not authorized to update this tweet")
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId, 
        {
            $set:{
                content:content,
            }
        }, 
        {
            new: true
        })
        res.status(200).json(new apiResponse(200,"Tweet updated", {newTweet})
    )
})

const deleteTweet = asyncHandler(async (req, res, next) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new apiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!((tweet.owner).equals(req.user._id))){
        throw new apiError(403, "You are not authorized to delete this tweet")
    }

    try {
        await Tweet.findByIdAndDelete(tweetId)
    } catch (error) {
        throw new apiError(500,"Some Error occur while deleting tweet")
    }
    res.status(200).json(new apiResponse(200, "Tweet deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}