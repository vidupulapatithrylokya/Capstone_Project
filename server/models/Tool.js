const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    description:{
        type:String,
        default:""
    },

    category:{
        type:String,
        default:""
    },

    image:{
        type:String,
        default:""
    },

    link:{
        type:String,
        default:""
    },

    isPremium:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
}
);

module.exports = mongoose.model("Tool", toolSchema);