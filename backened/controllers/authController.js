const bcrypt=require("bcryptjs");
const User=require("../model/User");
const  jwt=require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;

const generateToken=(userid)=>
{
    return jwt.sign({id:userid},process.env.JWT_SECRET,{expiresIn:"7d"});
};



 
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const profileImageUrl=req.file
        const imageuploader=await cloudinary.uploader.upload(profileImageUrl.path)
  
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

         
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl:imageuploader.secure_url,
        });

        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const loginUser=async(req,res)=>
{
   try {
     const {email,password}=req.body;
     
      const user=await User.findOne({email});

      if(!user)
      {
          return res.status(500).json({message:"invalid password"});
      }

      const  ismatch=await bcrypt.compare(password,user.password);
       
      if(!ismatch)
      {
        return res.status(500).json({message:"Invalid email or password"});

      }

     res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  profileImageUrl: user.profileImageUrl,
  token: generateToken(user._id),
  debugToken: jwt.decode(generateToken(user._id))  
});
   } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
   }
};


const getUserProfile=async(req,res)=>
{
   try {
    const user=await User.findById(req.user.id).select("-password");

     if(!user)
     {
        return res.status(404).json({message:"user not found"});
     }
     res.json(user);
   } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

 
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  uploadImage,
};
