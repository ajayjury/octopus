import { errorLog } from "../../config/logger.js";
import Menu from "../../models/Menu.js";

export const userMenusList = async(req, res)=>{
    try {
        let menuList = await Menu.find({ for: 'customer' });
        res.status(200).send({
            status: true,
            msg: "Menu List Get Successfully",
            data: menuList
        });
    } catch (error) {
        errorLog(error);
        res.status(500).send({ status: false, msg: "Something Went Wrong" });
    }
}