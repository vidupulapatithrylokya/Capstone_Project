const express=require("express");

const router=express.Router();

const {
bookSession,
getStudentSessions,
getMentorSessions,
updateSessionStatus
}=require("../controllers/sessionController");

const {
protect,
authorizeRoles
}=require("../middleware/authMiddleware");

// Student
router.post(
"/",
protect,
authorizeRoles("student"),
bookSession
);

router.get(
"/student",
protect,
authorizeRoles("student"),
getStudentSessions
);

// Mentor
router.get(
"/mentor",
protect,
authorizeRoles("mentor"),
getMentorSessions
);

router.put(
"/:id",
protect,
authorizeRoles("mentor"),
updateSessionStatus
);

module.exports=router;