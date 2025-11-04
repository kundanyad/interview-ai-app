
import { API_PATHS }  from "./apiPaths";
import axiosInstance from "./axiosInstance";



const uploadimage=async(imageFile)=>
{
    const formdata=new FormData();
    formdata.append("image",imageFile);

    try {
        const response=await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE,formdata,{
            headers:{
                "Content-Type":"multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Image upload failed:",error);
        return {error:"Image upload failed. Please try again."};
    }
}
export default uploadimage;