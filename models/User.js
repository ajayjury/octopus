import { model, Schema } from "mongoose";

const userSchema = Schema({
    firstName       : { type:String, index: true},
    lastName        : { type:String, index: true},
    email           : { type: String, index: true, default: null },
    pan             : { type: String, index: true, default: null },
    aadhar          : { type: String, index: true, default: null },
    mobile          : { type: Number, index: true, default: null },
    image           : { type: String, default:null, index: true},
    role            : { type: String, index: true},
    password        : { type: String },  
    dob             : { type: String ,index: true},
    apiKey          : { type: String ,index: true},
    apiSecret       : { type: String ,index: true},
    clientId        : { type: String ,index: true},
    clientPassword  : { type: String ,index: true},
    totpKey         : { type: String ,index: true},
    requestToken    : { type: String ,index: true},
    accessToken     : { type: String ,index: true},
    emailOtp        : { type: Number },
    isEmailVerify   : { type: Boolean, default: false },     
    mobileOtp       : { type: Number },
    isMobileVerify  : { type: Boolean, default: false },
    type            : { type: String, enum: ['admin', 'customer','doctor','employee'], default: 'customer', index: true},
    isRegistered    : { type:Boolean, default: false },
    isActive        : { type:Boolean, default: true },
    isDeleted       : { type:Boolean, default: false },
},{timestamps:true});


export default model('user', userSchema); 