import { validationResult } from "express-validator";
import { errorResponse, responseWithoutData } from "../helpers/helper.js";
import { errorLog } from "../config/logger.js";

export const adminValiation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: errors?.array()[0]?.msg
        });
    }else{
        next();
    }    
}



export const uploadImageValdator = (req, res, next) => {
    if (req.body.type === "Category" || req.body.type === "Product" || req.body.type === "Testimonial" || req.body.type === "CaseStudy") {
        if (req.file) {
            next();
        } else {
            responseWithoutData(res, 400, false, "Image field is required");
        }
    } else {
        responseWithoutData(res, 400, false, "Type must be Category or Product");
    }
}