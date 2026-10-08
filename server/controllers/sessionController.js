const Session=require("../models/Session");

// Book Session
const bookSession=async(req,res)=>{
try{

const session=await Session.create({
mentor:req.body.mentor,
student:req.user._id,
course:req.body.course,
topic:req.body.topic,
scheduledDate:req.body.scheduledDate
});

res.status(201).json({
success:true,
session
});

}
catch(error){
res.status(500).json({
success:false,
message:error.message
});
}
};

// Student Sessions
const getStudentSessions=async(req,res)=>{
try{

const sessions=await Session.find({
student:req.user._id
})
.populate("mentor","name")
.populate("course","title");

res.status(200).json({
success:true,
sessions
});

}
catch(error){
res.status(500).json({
success:false,
message:error.message
});
}
};

// Mentor Sessions
const getMentorSessions=async(req,res)=>{
try{

const sessions=await Session.find({
mentor:req.user._id
})
.populate("student","name")
.populate("course","title");

res.status(200).json({
success:true,
sessions
});

}
catch(error){
res.status(500).json({
success:false,
message:error.message
});
}
};

// Update Status
const updateSessionStatus=async(req,res)=>{
try{

const session=await Session.findById(req.params.id);

session.status=req.body.status;

if(req.body.meetingLink){
session.meetingLink=req.body.meetingLink;
}

await session.save();

res.status(200).json({
success:true,
session
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
bookSession,
getStudentSessions,
getMentorSessions,
updateSessionStatus
};