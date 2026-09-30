import { cloudinaryUpload } from "../../common/upload/multer.js";

export const uploadAvatar = async (image) =>{
    try {
        const result = await cloudinaryUpload(image);
        console.log('CLOUDINARY:', result);
        const { url } = result;
        return sendSuccess({
          response,
          data: url,
          statusCode: 200,
          messageCode: 607,
        });
      } catch (error) {
        console.error('CLOUDINARY ERROR:', error);
    
        next(error);
      }
}