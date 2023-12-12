import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Permission from "../../models/Permission.js"


export const getPermissionByRole = async(req, res)=>{
    try {
        let permission = await Permission.findOne({ roleId: req.body.roleId });
        if(permission){
            responseWithData(res, 200, true, "Permission Fetch Successfully", permission);
        }else{
            responseWithoutData(res, 404, false, "Permission Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const assignPermissionsToRole = async(req, res)=>{
    try {
        let user = await authValues(req.headers['authorization']);
        let permisssion = Permission.create({
            roleId  : req.body.roleId, 
            menus   : req.body.menus,
            addedBy : user._id
        });
        if(permisssion){
            responseWithoutData(res, 200, true, "Permission Created Successfully")
        }else{
            responseWithoutData(res, 403, false, "Failed to Create Permission")
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}