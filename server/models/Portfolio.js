const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    headline:{
        type:String,
        default:""
    },

    about:{
        type:String,
        default:""
    },

    skills:[
        String
    ],

    github:{
        type:String,
        default:""
    },

    linkedin:{
        type:String,
        default:""
    },

    resume:{
        type:String,
        default:""
    },

    projects:[
        {
            title:String,
            description:String,
            link:String
        }
    ]
},
{
    timestamps:true
}
);

module.exports = mongoose.model("Portfolio", portfolioSchema);