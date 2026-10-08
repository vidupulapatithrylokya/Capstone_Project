const express = require("express");

const router = express.Router();

const {
savePortfolio,
getPortfolio
}=require("../controllers/portfolioController");

const {protect}=require("../middleware/authMiddleware");

router.post("/",protect,savePortfolio);

router.get("/",protect,getPortfolio);

module.exports=router;