const multer=require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files go
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // unique file name
  }
});


const filefilter=(req,file,cb)=>
{
    const allowedTypes=['image/jpeg','image/png','image/jpg'];

    if(allowedTypes.includes(file.mimetype))
    {
        cb(null,true);
    }
    else 
    {
        cb(new Error('Only.jpeg,.jpg and .png formate are allowed'),false);
    }
};

const upload=multer({storage,filefilter});

module.exports=upload;



