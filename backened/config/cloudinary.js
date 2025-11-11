const cloudinary = require('cloudinary').v2;
// hey dude

const cloudDB=async()=>{
    cloudinary.config({
        api_key:process.env.CLOUDINARY_APIKEY,
        api_secret:process.env.CLOUDINARY_APISECRET,
        cloud_name:process.env.CLOUDINARY_NAME
    })
}

module.exports= cloudDB