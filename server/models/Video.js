const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        default:""
    },

    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },

    mentor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    videoUrl:{
        type:String,
        required:true
    },

    thumbnail:{
        type:String,
        default:""
    },

    duration:{
        type:Number,
        default:0
    }

},
{
    timestamps:true
}
);

module.exports = mongoose.model("Video", videoSchema);