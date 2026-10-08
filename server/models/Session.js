const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
{
    mentor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    },

    topic:{
        type:String,
        required:true
    },

    scheduledDate:{
        type:Date,
        required:true
    },

    duration:{
        type:Number,
        default:60
    },

    meetingLink:{
        type:String,
        default:""
    },

    status:{
        type:String,
        enum:["Pending","Approved","Completed","Cancelled"],
        default:"Pending"
    }

},
{
    timestamps:true
}
);

module.exports=mongoose.model("Session",sessionSchema);