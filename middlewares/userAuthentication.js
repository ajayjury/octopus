import jwt from "jsonwebtoken";
import { JWT_SECRET_TOKEN } from "../config/config.js";
import { errorLog } from "../config/logger.js";
import { authValues, errorResponse, responseWithoutData } from "../helpers/helper.js";
import User from "../models/User.js";

export const userAuthentication = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return responseWithoutData(res, 401, false, "Unauthorized");
        }
        jwt.verify(token, JWT_SECRET_TOKEN, async function (err, userId) {
            if (err) {
                console.log(err);
                return res.status(401).send({ status: false, msg: "Token Expired" });
            }else{
                var decoded = await authValues(token);
                if (decoded && decoded.type === "customer") {
                    if(decoded.isActive === true){
                        if(decoded.isEmailVerify === true || decoded.isMobileVerify === true){
                            next();
                        }else{
                            if(req.url === '/verify-otp' || req.url === '/resend-otp'){
                                next();
                            }else{
                                return res.status(401).send({ status:false, msg: "Please Verify Your Email Id Or Mobile No" });
                            }
                        }     
                    }else{
                        return res.status(401).send({ status: false, msg: "User is Inactive Please Contact Us" });
                    }
                }else{
                    return res.status(401).send({ status: false, msg: "Invalid Token" });
                }   
            }
        });
    } catch (err) {
        errorLog(err);
        errorResponse(res);
    }
}