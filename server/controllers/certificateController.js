const Certificate=require("../models/Certificate");
const crypto=require("crypto");

// Generate Certificate
const generateCertificate=async(req,res)=>{
try{

const certificate=await Certificate.create({

student:req.user._id,

course:req.body.course,

certificateId:crypto.randomBytes(8).toString("hex")

});

res.status(201).json({
success:true,
certificate
});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}
};

// Student Certificates
const getCertificates=async(req,res)=>{
try{

const certificates=await Certificate.find({

student:req.user._id

})
.populate("course","title");

res.status(200).json({

success:true,

certificates

});

}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}
};

// Verify Certificate
const verifyCertificate=async(req,res)=>{
try{

const certificate=await Certificate.findOne({

certificateId:req.params.id

})
.populate("student","name")
.populate("course","title");

if(!certificate){

return res.status(404).json({

success:false,

message:"Certificate not found"

});

}

res.status(200).json({

success:true,

certificate

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

generateCertificate,

getCertificates,

verifyCertificate

};