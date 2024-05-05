import mongoose from "mongoose";

const videoSchema = mongoose.Schema({
    videoFile: {
        type: String,
        require: true
    },
    thumbnail: {
        type: String,
        require: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    duration: {
        type: Number, //cloud 
        require:true
    },
    views: {
        type: Number,
        default:0
    },
    isPublish: {
        type: Boolean,
        default:true
    }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate);

export const video = mongoose.model("video", videoSchema);