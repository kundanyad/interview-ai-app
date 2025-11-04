const express=require("express");
const {createSession,getSessionById,getMySession,deleteSession}=require('../controllers/sessionController');
const {protect}=require('../middleware/authMiddleware');


const route=express.Router();



route.post("/create",protect,createSession);
route.get("/my-sessions", protect, getMySession);  
route.get("/:id",protect,getSessionById);
route.delete("/:id",protect,deleteSession);


module.exports=route;