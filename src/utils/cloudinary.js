
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
; (async function () {

    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Upload an image


    const uploadOnCloudinary = async (localFilePath) => {

        try {
            if (!localFilePath) return null;
            // upload file

            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            });
            // file has been uploaded 
            console.log("File uploaded to Cloudinary successfully!", response.url);
            return response;

        } catch (error) {
            fs.unlinkSync(localFilePath); // remove locally saved temp file as the upload operation failed
            return null;
        }
 
    }
})();