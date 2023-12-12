import express from "express";
import morgan from "morgan";
import { body, validationResult } from "express-validator";
export const userRoute = express.Router();
export const userAuthRoute = express.Router();


/***************************
        CUSTOM IMPORTS
****************************/
import User from "../models/User.js";
import { login, verifyOtp, userRegister, resendOtp, logout } from "../controllers/user/authController.js";
import { userValiation } from "../validation/userValidation.js";
import { userMenusList } from "../controllers/user/menuController.js";
import { autoLogin, getOpenPosition, checkBuyOrder, historicalData, instumentData, realTimeLtpNifty50, recordHistory, zerodhaCredentialsSave } from "../controllers/user/zerodhaController.js";
/* Middleware For Creating Console Log of Routes*/
userAuthRoute.use(morgan('dev'));
userRoute.use(morgan('dev'));

/****************************
  REGISTER & LOGIN ROUTES
****************************/

userRoute.post('/login', [
  body('type', 'Type field is Required/Invaild Email').notEmpty().custom((item) => {
    if (item != 'email' && item != 'mobile') {
      throw Error("Type Only have selected Value Mobile Or Email!!");
    }
    return true;
  }),
  body('value', 'Email or Mobile field is Required').notEmpty().custom((item, { req }) => {
    if (req?.body?.type == 'email') {
      let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
      if (regex.test(req?.body?.value) == false) {
        throw Error("Valid Email is required!!");
      }
    } else if (req?.body?.type == 'mobile') {
      if ((req?.body?.value?.length < 10 && req?.body?.value?.length > 10) || Number(req?.body?.value) == NaN) {
        throw Error("Please Enter Valid Mobile No!!");
      }
    }
    return true;
  }),
], userValiation, login);

userRoute.post('/verify-otp', [
  body('type', 'Type field is Required/Invaild Email').notEmpty().custom((item) => {
    if (item != 'email' && item != 'mobile') {
      throw Error("Type Only have selected Value Mobile Or Email!!");
    }
    return true;
  }),
  body('value', 'Email or Mobile field is Required').notEmpty().custom((item, { req }) => {
    if (req?.body?.type == 'email') {
      let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
      if (regex.test(req?.body?.value) == false) {
        throw Error("Valid Email is required!!");
      }
    } else if (req?.body?.type == 'mobile') {
      if ((req?.body?.value?.length < 10 && req?.body?.value?.length > 10) || Number(req?.body?.value) == NaN) {
        throw Error("Please Enter Valid Mobile No!!");
      }
    }
    return true;
  }),
  body('otp', 'Otp field is Required').notEmpty()
], userValiation, verifyOtp);

userRoute.post('/register', [
  body('type', 'Type field is Required/Invaild Email').notEmpty().custom((item) => {
    if (item != 'email' && item != 'mobile') {
      throw Error("Type Only have selected Value Mobile Or Email!!");
    }
    return true;
  }),
  body('value', 'Email or Mobile field is Required').notEmpty().custom(async (item, { req }) => {
    if (req?.body?.type == 'email') {
      let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
      if (regex.test(req?.body?.value) == false) {
        throw Error("Valid Email is required!!");
      }
      if (await User.findOne({ email: item, name: { $ne: null } })) {
        throw new Error('Email already in Exist');
      }
    } else if (req?.body?.type == 'mobile') {
      if ((req?.body?.value?.length < 10 && req?.body?.value?.length > 10) || Number(req?.body?.value) == NaN) {
        throw Error("Please Enter Valid Mobile No!!");
      }
    }
    return true;
  }),
  body('email').optional().isEmail().custom(async (email, { req }) => {
    if (req?.body?.type == 'mobile' || (req?.body?.type == 'email' && req?.body?.value != email)) {
      const user = await User.findOne({ email: email });
      if (user) {
        throw new Error('Email already in Exist');
      } else {
        return true;
      }
    } else {
      return true;
    }
  }),
  body('mobile', 'Mobile field is Required').notEmpty().custom(async (mobile, { req }) => {
    if (req?.body?.type == 'email' || (req?.body?.type == 'mobile' && req?.body?.value != mobile)) {
      const user = await User.findOne({ mobile: mobile });
      if (user) {
        throw new Error('Mobile already in Exist');
      } else {
        return true;
      }
    } else {
      return true;
    }
  }),
  body('firstName', 'firstName  field is Required').notEmpty(),
  body('lastName', 'lastName  field is Required').notEmpty(),
  body('aadhar', 'aadhar  field is Required').notEmpty().isLength({ min: 12, max: 12 }).withMessage('aadhar No should have 12 Number').custom(async (aadhar) => {
    const user = await User.findOne({ aadhar: aadhar });
    if (user) {
      throw new Error('Aadhar already in Exist');
    } else {
      return true;
    }
  }),
  body('pan', 'pan no field is Required').notEmpty().isLength({ min: 10, max: 10 }).withMessage('pan No should have 10 character').custom(async (pan) => {
    const user = await User.findOne({ pan: pan });
    if (user) {
      throw new Error('pan no already in Exist');
    } else {
      return true;
    }
  }),
], userValiation, userRegister);


userRoute.post('/resend-otp', [
  body('type', 'Type field is Required/Invaild Email').notEmpty().custom((item) => {
    if (item != 'email' && item != 'mobile') {
      throw Error("Type Only have selected Value Mobile Or Email!!");
    }
    return true;
  }),
  body('value', 'Email or Mobile field is Required').notEmpty().custom((item, { req }) => {
    if (req?.body?.type == 'email') {
      let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
      if (regex.test(req?.body?.value) == false) {
        throw Error("Valid Email is required!!");
      }
    } else if (req?.body?.type == 'mobile') {
      if ((req?.body?.value?.length < 10 && req?.body?.value?.length > 10) || Number(req?.body?.value) == NaN) {
        throw Error("Please Enter Valid Mobile No!!");
      }
    }
    return true;
  })
], userValiation, resendOtp);


/****************************
  USER AUTHENTICATED ROUTES 
****************************/

/* MENU ROUTES START */

userAuthRoute.get('/menus-list', userMenusList);

/* MENU ROUTES END */

/* ZERODHA API CREDENTIALS SAVE ROUTES START */

userAuthRoute.post('/zerodha-credentials-save', [
  body('apiKey', 'apiKey Field is required!').notEmpty().custom(async (item) => {
    if (await User.findOne({ apiKey: item })) {
      throw new Error('apiKey already in Exist');
    }
    return true;
  }),
  body('apiSecret', 'apiSecret Field is required!').notEmpty().custom(async (item) => {
    if (await User.findOne({ apiSecret: item })) {
      throw new Error('apiSecret already in Exist');
    }
    return true;
  }),
  body('clientId', 'clientId field is required!').notEmpty().custom(async (item) => {
    if (await User.findOne({ clientId: item })) {
      throw new Error('clientId already in Exist');
    }
    return true;
  }),
  body('clientPassword', 'clientPassword field is required!').notEmpty(),
  body('totpKey', 'totpKey Field is required!').notEmpty().custom(async (item) => {
    if (await User.findOne({ totpKey: item })) {
      throw new Error('totpKey already in Exist');
    }
    return true;
  }),
], userValiation, zerodhaCredentialsSave);

/* ZERODHA API CREDENTIALS SAVE ROUTES END */

/* ZERODHA AUTO LOGIN  ROUTES START HERE */

userAuthRoute.get('/auto-login', autoLogin);

/* ZERODHA AUTO LOGIN  ROUTES END HERE */

/* ZERODHA INSTUMENT  ROUTES START HERE */

userAuthRoute.get('/instument-data', instumentData);
userAuthRoute.post('/historical-data', [
  body('instrument_token', 'instrument_token Field is required!').notEmpty(),
  body('interval', 'interval Field is required!').notEmpty().custom(async (item) => {
    if (item == 'minute' || item == 'day' || item == '3minute' || item == '5minute' || item == '10minute' || item == '15minute' || item == '30minute' || item == '60minute') {
      return true;
    }
    throw new Error('Invalid interval you have provided!!');
  }),
  body('fromDate', 'fromDate field is required!').notEmpty(),
  body('toDate', 'toDate field is required!').notEmpty(),
], userValiation, historicalData);
// userAuthRoute.get('/ltp-nifty50', ltpNifty50);
// userAuthRoute.get('/real-time-ltp-nifty50', realTimeLtpNifty50);
userAuthRoute.get('/record-history', recordHistory);

userAuthRoute.get('/get-open-position', getOpenPosition);
userAuthRoute.get('/check-buy-order', checkBuyOrder);
/* ZERODHA INSTUMENT  ROUTES END HERE */



/* LOGOUT ROUTE START */

userAuthRoute.get('/logout', logout);

/* LOGOUT ROUTE END */
