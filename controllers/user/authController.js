import User from "../../models/User.js";
import { errorLog } from "../../config/logger.js";
import { emailVerification, errorResponse, getJwtToken, responseWithoutData, sendMobileOtp, responseWithData, destroyToken } from "../../helpers/helper.js";

export const login = async (req, res) => {
    try {
        let otp = Math.floor(1000 + Math.random() * 9000);
        let user = await User.findOne({[req?.body?.type]:req?.body?.value});
        if(user == null){ 
            user = await User.create({
                [req?.body?.type]:req?.body?.value,
            });
        }
        if(req.body.type=='mobile'){
            sendMobileOtp(user.mobile, otp);
            let updateResult = await User.findByIdAndUpdate(user._id, {
                mobileOtp: otp
            }, { new: true });
            if (updateResult) {
                responseWithoutData(res, 200, true, "Otp Send Successfully On Mobile");
            }
        }else if(req.body.type=='email'){
            let updateResult = await User.findByIdAndUpdate(user._id, {
                emailOtp: otp
            }, { new: true });
            if (updateResult) {
                emailVerification(user.email, "Skinocare Email Verification", otp.toString()); // Email Sending
                responseWithoutData(res, 200, true, "Otp Send Successfully On Email");
            }
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const verifyOtp = async (req, res) => {
    try {
        let user = await User.findOne({[req?.body?.type]:req?.body?.value});
        let oldUser = (user?.isRegistered === true) ? 1 : 0;
        if (req.body.type == 'email') {  
            if(user.emailOtp === Number(req.body.otp)) {
                let result = await User.findByIdAndUpdate(user._id, {
                    emailOtp: null,
                    isEmailVerify: true
                }, { new: true });
                if(oldUser == 1) {
                    return responseWithData(res, 200, true, "Login Successfully!!.",{...user?._doc,token:getJwtToken(user?._id),isRegistered:true});
                }else{
                    return responseWithData(res, 200, true, "Email Id Verified Successfully.",{isRegistered:false});
                }
            }
        } else if (req.body.type == 'mobile') {
            if(user.mobileOtp === Number(req.body.otp)) {
                let result = await User.findByIdAndUpdate(user._id, {
                    mobileOtp: null,
                    isMobileVerify: true
                }, { new: true });  
                if(oldUser == 1) {
                    return responseWithData(res, 200, true, "Login Successfully!!.",{...user?._doc,token:getJwtToken(user?._id),isRegistered:true});
                }else{
                    return responseWithData(res, 200, true, "Mobile No Verified Successfully.",{isRegistered:false});
                } 
            }
        }
        responseWithoutData(res, 500, false, "OTP Verification is failed.");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const userRegister = async (req, res) => {
    try {
        let user = await User.findOne({[req?.body?.type]:req?.body?.value});
        if (user) {
            let emailMobile = (req?.body?.type == "email") ? {email:req?.body?.value,mobile:req?.body?.mobile} : {email:req?.body?.email,mobile:req?.body?.value};
            let checkUser = null
            if(req?.body?.type == "mobile"){
                checkUser = await User.findOne({email:req?.body?.email});
            } else if(req?.body?.type == "email") {
                checkUser = await User.findOne({mobile:req?.body?.mobile});
            }
            if(checkUser != null){
                return responseWithoutData(res, 500, false, `${(req?.body?.type == "email")? 'Mobile' : 'Email'} already in Used.`);
            }
            await User.findByIdAndUpdate(user?._id,{$set:{
                firstName:req?.body?.firstName,  
                lastName:req?.body?.lastName,  
                aadhar:req?.body?.aadhar,  
                pan:req?.body?.pan,  
                // age:req?.body?.age,
                // gender:req?.body?.gender,
                isRegistered:true, 
                ...emailMobile
            }});
            user = await User.findOne({[req?.body?.type]:req?.body?.value});
            return responseWithData(res, 200, true, "Registered Successfully!!.",{...user?._doc,token:getJwtToken(user?._id)});
        } else {
            return responseWithoutData(res, 500, false, "Verify Email or Mobile First.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }  
}

export const resendOtp = async (req, res) => {
    try {
        let otp = Math.floor(1000 + Math.random() * 9000);
        let user = await User.findOne({[req?.body?.type]:req?.body?.value});
        if(user == null){
            user = await User.create({
                [req?.body?.type]:req?.body?.value,
            });
        }
        if(req.body.type=='mobile'){
            sendMobileOtp(user.mobile, otp);
            let updateResult = await User.findByIdAndUpdate(user._id, {
                mobileOtp: otp
            }, { new: true });
            if (updateResult) {  
                responseWithoutData(res, 200, true, "Otp Resend Successfully On Mobile");
            }   
        }else if(req.body.type=='email'){
            let updateResult = await User.findByIdAndUpdate(user._id, {
                emailOtp: otp
            }, { new: true });
            if (updateResult) {
                emailVerification(user.email, "Skinocare Email Verification", otp.toString()); // Email Sending
                responseWithoutData(res, 200, true, "Otp Resend Successfully On Email");
            }
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const logout = async(req, res)=>{
    try {
        destroyToken(req.headers['authorization']);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}
