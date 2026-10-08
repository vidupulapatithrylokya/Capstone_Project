const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
{
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    question:{
        type:String,
        required:true,
        trim:true
    },

    replies:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },

            message:String,

            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ],

    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]

},
{
    timestamps:true
}
);

module.exports=mongoose.model("Discussion",discussionSchema);