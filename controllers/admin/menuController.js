import Menu from "../../models/Menu.js";
import { errorLog } from "../../config/logger.js";
import { errorResponse } from "../../helpers/helper.js";


export const adminMenusList = async(req, res)=>{
    try {
        let menuList = await Menu.find({ for: 'admin' });
        res.status(200).send({
            status: true,
            msg: "Menu List Get Successfully",
            data: menuList
        });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const addMenus = async(req, res)=>{
    try {
        
    } catch (error) {
        
    }
}


export const deleteMenus = async(req, res)=>{
    try {
        
    } catch (error) {
        
    }
}