import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
    api_key: 'process.env.CLOUDINARY_API_KEY', 
    api_secret: 'process.env.CLOUDINARY_SECRET'
});


const UploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            console.error(`Local file path doest provided`)
            return null;    
        }
        const responce = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log(`File uploaded succesfully `, responce.url);
        
        return responce;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}