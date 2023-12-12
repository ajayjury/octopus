import { uploadsPath } from "../../config/config.js";
import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData, uploadToS3 } from "../../helpers/helper.js";
import Upload from "../../models/Upload.js";

export const uploadImage = async(req, res)=>{
    try {
        if(req.file){
            let user = await authValues(req.headers['authorization']);
            let fileName = req.body.type.toLowerCase() + '_' + Date.now().toString() + '_' + req.file.originalname;
            let filePath = uploadsPath(req.body.type);
            let imageUrl = await uploadToS3(fileName, filePath, req.file.buffer);
            let uploadImage = await Upload.create({
                fileName: fileName,
                filePath: filePath,
                relatedWith: req.body.type,
                addedBy: user._id,
            });
            if(uploadImage){
                responseWithData(res, 200, true, "Image Uploaded Successfully", { uploadImage });
            }else{
                responseWithoutData(res, 501, false, "Image Uploadation failed");
            }
        }        
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}