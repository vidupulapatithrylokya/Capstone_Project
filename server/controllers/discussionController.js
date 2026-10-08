const Discussion=require("../models/Discussion");

// Ask Question
const askQuestion=async(req,res)=>{
try{

const discussion=await Discussion.create({
course:req.body.course,
user:req.user._id,
question:req.body.question
});

res.status(201).json({
success:true,
discussion
});

}
catch(error){
res.status(500).json({
success:false,
message:error.message
});
}
};

// View Discussions
const getDiscussions=async(req,res)=>{
try{

const discussions=await Discussion.find({
course:req.params.courseId
})
.populate("user","name")
.populate("replies.user","name");

res.status(200).json({
success:true,
count:discussions.length,
discussions
});

}
catch(error){
res.status(500).json({
success:false,
message:error.message
});
}
};

// Reply
const replyDiscussion=async(req,res)=>{
try{

const discussion=await Discussion.findById(req.params.id);

discussion.replies.push({
user:req.user._id,
message:req.body.message
});

await discussion.save();

res.status(200).json({
success:true,
discussion
});

}
catch(error){
res.status(500).json({
success:false,
message:error.message
});
}
};

// Like
const likeDiscussion=async(req,res)=>{
try{

const discussion=await Discussion.findById(req.params.id);

if(!discussion.likes.includes(req.user._id)){
discussion.likes.push(req.user._id);
}

await discussion.save();

res.status(200).json({
success:true,
likes:discussion.likes.length
});

}
catch(error){
res.status(500).json({
success:false,
message:error.message
});
}
};

module.exports={
askQuestion,
getDiscussions,
replyDiscussion,
likeDiscussion
};