import  express from "express";
import { getSettingByType } from "../controllers/webController.js";
export const webRoute = express.Router();

/*****************************
 ******** WEB ROUTES *********
 ****************************/

/* SETTING ROUTE START */

webRoute.get('/settings/:type', getSettingByType); 

/* SETTING ROUTE END */ 

