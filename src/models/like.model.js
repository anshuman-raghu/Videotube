import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    likeBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    vedio:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vedio",
    },
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
    },
},
{timestamps:true}
)

export const Like = mongoose.model("Like", likeSchema);