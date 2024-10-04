import mongoose, { isValidObjectId } from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res, next) => {
    const {name} = req.body
    const {_id} = req.user
    const userId = _id

    const playlist = await Playlist.create({
        name,
        owner: userId
    })

    if(!playlist){
        throw new apiError(400, "Playlist not created")
    }

    res.status(201).json(new apiResponse(201, "Playlist created successfully", {playlist}))
})

const getUserPlaylists = asyncHandler(async (req, res, next) => {

    const {_id} = req.user
    const userId = _id

    if(!isValidObjectId(userId)){
        throw new apiError(400, "Invalid user id")
    }

    const playlists = await Playlist.find({owner: userId})

    if(!playlists){
        throw new apiError(404, "No playlists found")
    }

    res.status(200).json(new apiResponse(200, "Playlists found", {playlists}))
})

const getPlaylistById = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new apiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new apiError(404, "Playlist not found")
    }

    res.status(200).json(new apiResponse(200, "Playlist found", {playlist}))
})
const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params
    const {videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(playlist.owner.toString() !== req.user._id.toString()){

        throw new apiError(403, "You are not authorized to perform this action")
    }

    playlist.videos.push(videoId)
    //pusing vedio id to playlist

    if(!playlist){
        throw new apiError(400, "Video not added to playlist")
    }

    res.status(200).json(new apiResponse(200, {playlist} , "Video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params
    const {videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400, "Invalid playlist or video id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new apiError(403, "You are not authorized to perform this action")
    }

    playlist.videos.pull(videoId)
    playlist.save()
    res.status(200).json(new apiResponse(200, "Video removed from playlist", {playlist}))
})

const deletePlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new apiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new apiError(403, "You are not authorized to perform this action")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletePlaylist){
        throw new apiError(400, "Playlist not deleted")
    }

    res.status(200).json(new apiResponse(200, "Playlist deleted"))
})

const updatePlaylist = asyncHandler(async (req, res, next) => {
    const {playlistId} = req.params
    const {name} = req.body
    
    if(!isValidObjectId(playlistId)){
        throw new apiError(400, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)

    
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new apiError(403, "You are not authorized to perform this action")
    }
    
    
    playlist.name = name
    playlist.save()
    //updating name of playlist
    if(!playlist){
        throw new apiError(400, "Playlist not updated")
    }

    res.status(200).json(new apiResponse(200, "Playlist updated", {playlist}))
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