const express=require("express");

const router=express.Router();

const {
askQuestion,
getDiscussions,
replyDiscussion,
likeDiscussion
}=require("../controllers/discussionController");

const {protect}=require("../middleware/authMiddleware");

router.post("/",protect,askQuestion);

router.get("/:courseId",protect,getDiscussions);

router.post("/reply/:id",protect,replyDiscussion);

router.post("/like/:id",protect,likeDiscussion);

module.exports=router;