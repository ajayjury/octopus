import { errorLog } from "../config/logger.js";
import { errorResponse, responseWithData, responseWithoutData } from "../helpers/helper.js";
import Setting from "../models/Setting.js";

export const getSettingByType = async(req, res)=>{
    try {
        let type = req?.params?.type;
        let setting = await Setting.findOne({ type:type });
        if(setting){
            responseWithData(res, 200, true, "Value Fetch Successfully", setting);
        }else{
            responseWithoutData(res, 404, false, "Type is Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}