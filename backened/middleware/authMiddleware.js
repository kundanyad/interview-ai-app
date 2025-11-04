const jwt=require('jsonwebtoken');
const User=require('../model/User')
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    console.log("Raw header:", req.headers.authorization);

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      console.log("Extracted token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded:", decoded);

      req.user = await User.findById(decoded.id).select("-password");
       next();
     
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};


module.exports={protect};