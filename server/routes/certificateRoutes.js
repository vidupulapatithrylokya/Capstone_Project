const express=require("express");

const router=express.Router();

const {

generateCertificate,

getCertificates,

verifyCertificate

}=require("../controllers/certificateController");

const {

protect,

authorizeRoles

}=require("../middleware/authMiddleware");

// Student

router.post(

"/",

protect,

authorizeRoles("student"),

generateCertificate

);

router.get(

"/",

protect,

authorizeRoles("student"),

getCertificates

);

// Public Verification

router.get(

"/verify/:id",

verifyCertificate

);

module.exports=router;