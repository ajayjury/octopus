import jwt from "jsonwebtoken";
import { JWT_SECRET_TOKEN, JWT_EXPIRES_IN, mailer, EMAIL_FROM, S3, AWS_S3_BUCKET, EXPIRES_SINGNED_URL } from "../config/config.js";
import User from "../models/User.js";
import axios from "axios";
import Upload from "../models/Upload.js";
// import zerodhaLogin from "zerodha-auto-login";
import totp from "totp-generator" ;
import puppeteer from "puppeteer"; 
import { KiteConnect } from 'kiteconnect';

export const getJwtToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET_TOKEN, {
        expiresIn: JWT_EXPIRES_IN,
    });
} 

export const errorResponse = (res) => {
    res.status(500).send({ status: false, msg: "Something Went Wrong" });
}

export const authValues = async (authToken) => {
    let result = jwt.verify(authToken, JWT_SECRET_TOKEN);
    let user = await User.findById(result.userId);
    return user;
}

export const isTokenVerified = (authToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(authToken, JWT_SECRET_TOKEN, async (err, result) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        })
    });
}



export const responseWithData = (res, code, status, message, data) => {
    res.status(code).send({ status: status, msg: message, data: data });
}

export const responseWithoutData = (res, code, status, message,) => {
    res.status(code).send({ status: status, msg: message, data: [] });
}

export const emailVerification = (to, subject, body) => {
    mailer.sendMail({
        from: EMAIL_FROM, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: body, // plain text body
        // html: "<b>Hello world?</b>", // html body
    });
}

export const sendMobileOtp = (mobile, otp) => {
    axios.get(`http://sms.softfix.in/submitsms.jsp?user=EsafeS&key=d5a7374c54XX&mobile=${mobile}&message=Dear%20User,%20Your%20OTP%20for%20login%20to%20Jio%20TrueConnect%20portal%20is%20Your%20SkinOCare%20OTP%20is%20${otp}%20.%20Valid%20for%2030%20minutes.%20Please%20do%20not%20share%20this%20OTP.%20Regards,%20Jio%20Trueconnect%20Team&senderid=DEALDA&accusage=1&entityid=1201159965850654415&tempid=1207167722926890489`).then((response) => {
        return true;
    }).catch((error) => {
        throw new Error(error);
    });
}

export const uploadToS3 = (fileName, filePath, fileData) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: AWS_S3_BUCKET,
            Key: filePath + '/' + fileName,
            Body: fileData,
        };
        S3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            return resolve(data);
        });
    });
};

export const getImageSingedUrlById = async (uploadId) => {
    let uploadData = await Upload.findOne({ _id: uploadId });
    return await getSignUrl(uploadData?.filePath + '/' + uploadData?.fileName);
}

export const getSignedUrl = async (fileKey, callback) => {
    S3.getSignedUrl('getObject', {
        Bucket: AWS_S3_BUCKET,
        Key: fileKey,
        Expires: EXPIRES_SINGNED_URL,
    }, (err, url) => {
        if (!err) {
            callback(null, url); // Return the URL via the callback
        } else {
            callback(err); // Handle errors via the callback
        }
    });

}

export const getSignUrl = async (fileKey) => {
    let url = await S3.getSignedUrlPromise('getObject', {
        Bucket: AWS_S3_BUCKET,
        Key: fileKey,
        Expires: EXPIRES_SINGNED_URL,
    });
    return url;
}

export const destroyToken = async (authToken) => {
    // let result = await jwt.
    return result;
} 

export const zerodhaAutoLogin = async (customer) => {
    const token = totp(customer?.totpKey);
    const login = await zerodhaLoginCustomize(
        customer?.apiKey,//"Public API Key",
        customer?.apiSecret,//"Secret API Key",
        customer?.clientId,//"Client ID",
        customer?.clientPassword,//"Client Password",
        token //"Totp"
    );
    await User.findByIdAndUpdate(customer?._id,{$set:{
        requestToken:login?.requestToken,
        accessToken:login?.accessToken
    }});
    return login?.accessToken;
}

export const getAccessToken = async (customer) =>{
    if(customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined){
        return responseWithoutData(res, 201, false, "Zerodha Api Credentials is empty,update First!");
    }
    let accessToken = customer?.accessToken;
    if(customer?.accessToken == undefined || customer?.accessToken == '' || customer?.accessToken == null) {
        accessToken = await zerodhaAutoLogin(customer);
    }
    return accessToken;
}

export const zerodhaApiCall = async (customer,method,url) => {
    return new Promise((resolve, reject)=>{
        let config = {
        method: method,
        maxBodyLength: Infinity,
        url: url,
        headers: { 
                'X-Kite-Version': '3', 
                'Authorization': `token ${customer?.apiKey}:${customer?.accessToken}`, 
                'Cookie': '_cfuvid=P.n4fnLkGdHaJdcBtniWV3YOCeYNhlqPgshYUsGzoGM-1701238169034-0-604800000'
            }
        };
        axios.request(config)
        .then((response) => {
            // console.log(JSON.stringify(response.data));
            resolve(response.data);
        })
        .catch(async (error) => {
            // console.log(error?.response?.data);
            if (error?.response?.data?.message == 'Incorrect `api_key` or `access_token`.' && error?.response?.data?.error_type == 'TokenException') {
                let accessToken = await zerodhaAutoLogin(customer);
                customer = {...customer,accessToken:accessToken};
                resolve(await zerodhaApiCall(customer,method,url));
            } else {
                resolve(error?.response?.data);
            }
        });
   });
}


export const zerodhaLoginCustomize = async (ApiKey,SecretKey,UserId,Password,Pin) =>{
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://kite.trade/connect/login?api_key=${ApiKey}&v=3`);
    await sleep(2000);
    await page.type("input[type=text]", UserId);
    await page.type("input[type=password]", Password);
    await page.keyboard.press("Enter");
    await sleep(2000);
    //await page.focus("input[type=text]").then((value) => console.log(value));
    await page.keyboard.type(Pin);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    const reqUrl = page.url();
    // console.log("Page URL:", page.url());
    const requestToken = new URL(reqUrl).searchParams.get('request_token');
    // console.log("Request Token: ", requestToken);
    await browser.close();
    try{
        const kc = new KiteConnect({ 
        api_key: ApiKey,
        });
        const response = await kc.generateSession(requestToken, SecretKey);
        const accessToken = response.access_token;
        // console.log("Access Token: ",accessToken);
        // console.log("Access Token: ",response);
        return {requestToken,accessToken};
    }catch (e){
        console.error(e);
    }
}

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const currentTimeStamp = (timestamp) => {
    const currentDate = new Date(timestamp);
    const currentDayOfMonth = ((currentDate.getDate()) > 9 ? (currentDate.getDate()) : '0'+(currentDate.getDate()));
    const currentMonth = ((currentDate.getMonth()) > 9 ? (currentDate.getMonth()+1) : '0'+(currentDate.getMonth()+1)); // Be careful! January is 0, not 1
    const currentYear = currentDate.getFullYear(); 
    // const currentHour = currentDate.getHours();
    // const currentMinute = currentDate.getMinutes();
    // const currentSeconds = currentDate.getSeconds();
    // const dateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
    //const dateString = currentYear + "-" + (currentMonth + 1) + "-" + currentDayOfMonth +" "+currentHour+":"+currentMinute+":"+currentSeconds;
    const dateString = currentYear + "-" + (currentMonth) + "-" + currentDayOfMonth;
    return dateString;
}

export const monthInString = async (monthNumber) => {
    const month = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return month[monthNumber]; 
}

export const checkExistance = async (strikeInstruments,positions) => {
    let positionData = [];
    for(let index in positions?.net) {
        let pdata = positions?.net?.[index];
        if(strikeInstruments.includes(pdata?.instrument_token)) {
            positionData.push({type:"net",...pdata});
        }
    }
    for(let index in positions?.day) {
        let pdata = positions?.day?.[index];
        if(strikeInstruments.includes(pdata?.instrument_token)) {
            positionData.push({type:"day",pdata});
        }
    }
    return positionData;
}

export const getTradingSymbol = async (customer,instrumentToken) => {
    const kite = new KiteConnect({ api_key: customer?.apiKey });
    kite.setAccessToken(customer?.accessToken);
    let instruments = await kite.getInstruments();
    const filterInstrumentByToken = instruments.filter((instrument) =>instrument.instrument_token == instrumentToken );
    return filterInstrumentByToken?.[0];
}