import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

//api config
cloudinary.config({
    cloud_name: process.env.ClOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECERT
});

//upload file
const uploadOncloud = async (localFile) => {
    try {
        if (!localFile) return null;
        const res = await cloudinary.uploader.upload(localFile, {
            resuource_type: "auto"
        })
        return 'successful';
    } catch (error) {
        fs.unlinkSync(localFile); //removes files from local server
        return null;
    }
}

export { uploadOncloud } 