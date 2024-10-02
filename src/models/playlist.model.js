import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    vedios:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vedio",
        }
    ],
},
{timestamps:true}
)

export const Playlist = mongoose.model("Playlist", playlistSchema);