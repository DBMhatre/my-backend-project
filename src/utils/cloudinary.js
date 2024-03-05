import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImgOnCloudinary = async (localFilePath) => {
  try {
    console.log("Localpath", localFilePath);

    if (!localFilePath) return null;

    //Upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      media_metadata: true,
      // asset_folder: "youtube",
    });
    //file uploaded successfully
    console.log("File uploaded using Cloudinary...!", response.url);

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //as opration failed we remove the File on our server
  }
};

const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //Upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      media_metadata: true,
      // asset_folder: "youtube",
    });

    //file uploaded successfully
    // console.log("File uploaded using Cloudinary...!", response.url);

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //as opration failed we remove the File on our server
  }
};

const deleteImgOnCloudinary = async (public_id) => {
  try {
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });
    return response;
  } catch (error) {
    return error;
  }
};
const deleteVideoOnCloudinary = async (public_id) => {
  try {
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: "video",
    });
    return response;
  } catch (error) {
    return error;
  }
};

export {
  uploadImgOnCloudinary,
  uploadVideoOnCloudinary,
  deleteImgOnCloudinary,
  deleteVideoOnCloudinary,
};
