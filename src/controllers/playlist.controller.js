import mongoose, { isValidObjectId } from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {User} from "../models/user.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res, next) => {
    const {name} = req.body
    const {userId} = req.user

    const playlist = await Playlistlaylist.create({
        name,
        owner: userId
    })

    if(!playlist){
        throw new ApiError(400, "Playlist not created")
    }

    res.status(201).json(new ApiResponse(201, "Playlist created successfully", {playlist}))
})

const getUserPlaylists = asyncHandler(async (req, res, next) => {
    const {userId} = req.user

    const playlists = await Playlist.find({owner: userId})

    if(!playlists){
        throw new ApiError(404, "No playlists found")
    }

    res.status(200).json(new ApiResponse(200, "Playlists found", {playlists}))
})

const getPlaylistById = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    res.status(200).json(new ApiResponse(200, "Playlist found", {playlist}))
})
const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params
    const {videoId} = req.body

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video id")
    }
    if(playlist.owner.toString() !== req.user._id.toString()){

        throw new ApiError(403, "You are not authorized to perform this action")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $push: {videos: videoId}
    }, {new: true})

    if(!playlist){
        throw new ApiError(400, "Video not added to playlist")
    }

    res.status(200).json(new ApiResponse(200, "Video added to playlist", {playlist}))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params
    const {videoId} = req.body

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video id")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {videos: videoId}
    }, {new: true})

    res.status(200).json(new ApiResponse(200, "Video removed from playlist", {playlist}))
})

const deletePlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not deleted")
    }

    res.status(200).json(new ApiResponse(200, "Playlist deleted"))
})

const updatePlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params
    const {name} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        name
    }, {new: true})

    if(!playlist){
        throw new ApiError(400, "Playlist not updated")
    }

    res.status(200).json(new ApiResponse(200, "Playlist updated", {playlist}))
})





export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}