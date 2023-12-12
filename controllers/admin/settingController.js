import Setting from "../../models/Setting.js";
import { errorLog } from "../../config/logger.js";
import { errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";


export const getSettings = async(req, res)=>{
    try {
        let settings = await Setting.find(); 
        responseWithData(res, 200, true,"Settings Fetched Successfully", settings);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addType = async(req, res)=>{
    try {
        let setting = await Setting.create({
            type: req.body?.type,
            value: []
        });
        if(setting){
            responseWithoutData(res, 200, true, "Type Added Successfully");
        }else{
            responseWithoutData(res, 403, false, "Failed to Added Type");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addAndUpdateValue = async(req, res)=>{
    try {
        let setting = await Setting.findOne({ type:req.body?.type });
        if(setting){
            setting.value = req.body?.value
            if(await setting.save()){
                responseWithoutData(res, 200, true, "Value Added Successfully");
            }
        }else{
            responseWithoutData(res, 403, false, "Failed to Added Value");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}