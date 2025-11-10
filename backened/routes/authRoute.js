const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadsMiddleware"); // multer config
const {protect}=require('../middleware/authMiddleware')
const { registerUser, loginUser, getUserProfile,uploadImage, getalluser } = require("../controllers/authController");

 
router.post("/register",upload.single('image'), registerUser);
router.post("/login", loginUser);
router.get("/profile",protect,getUserProfile);
router.post("/getall",getalluser)
 
router.post("/upload-image", upload.single("image"), uploadImage);

module.exports = router;
