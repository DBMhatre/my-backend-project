import {v2 as cloudinary} from cloudinary
import fs from "fs"

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})


const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;

        //Upload file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath, {resource_type : "auto"}
        )

        //file uploaded successfully
        console.log("File uploaded using Cloudinary...!",response.url);

        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)//as opration failed we remove the File on our server
    }
}

export {uploadOnCloudinary}