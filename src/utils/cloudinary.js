import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
});


const UploadOnCloudinary = async (localFilePath) => {
    try {      
        if(!localFilePath){
            console.error(`Local file path doest provided in Uplaod on Clou`)
            return null;    
        }
        const responce = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });
              
        fs.unlinkSync(localFilePath)
        return responce;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Cloudinary file Uplaod error ",error)

        return null;
    }
}

export {UploadOnCloudinary}