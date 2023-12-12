import { errorLog } from "../../config/logger.js";
import { authValues, checkExistance, currentTimeStamp, errorResponse, getTradingSymbol, monthInString, responseWithData, responseWithoutData, sleep, zerodhaApiCall, zerodhaAutoLogin, zerodhaLoginCustomize } from "../../helpers/helper.js";
import User from "../../models/User.js";
import DataRecord from "../../models/DataRecord.js";
import totp from "totp-generator";
import fs from "fs";
import Instument from "../../models/Instument.js";
import cron from 'node-cron';
// import WebSocket from 'ws'; 
import { KiteConnect, KiteTicker } from 'kiteconnect';
import Order from '../../models/Order.js';
cron.schedule('* * * * *', async () => {

    /**************************************** Data Recording ************************************************/
    //console.log('running a task every minute');
    const kite = new KiteConnect({ api_key: "covt43dshs0w6fen" });
    // Set the access token
    kite.setAccessToken("rxT1YueOJezQUPhgkJ8x8UqAffYEVXHB");
    // Fetch all instruments
    const instruments = await kite.getInstruments();
    // Filter instruments for NIFTY 50 options of the current expiry
    const nifty50OptionInstruments = instruments.filter(
        (instrument) =>
            instrument.exchange === "NSE" &&
            // instrument.segment === "OPT" &&
            instrument.tradingsymbol.startsWith("NIFTY") &&
            instrument.tradingsymbol.includes("50")
        // instrument.expiry === "2023-11-30" // Replace with the actual current expiry
    );
    nifty50OptionInstruments.map(async (nifty50Data) => {
        await Instument.create({ ...nifty50Data });
    });
    /**************************************** Data Recording ************************************************/
});

export const zerodhaCredentialsSave = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        const { apiKey, apiSecret, clientId, clientPassword, totpKey } = req?.body;
        let saveCredentials = await User.findByIdAndUpdate(customer?._id, {
            $set: {
                apiKey: apiKey,
                apiSecret: apiSecret,
                clientId: clientId,
                clientPassword: clientPassword,
                totpKey: totpKey,
            }
        });
        if (saveCredentials) {
            return responseWithData(res, 200, true, "Zerodha Credentials has been updated Successfully!!", { ...saveCredentials._doc, ...req?.body });
        } else {
            return responseWithoutData(res, 201, false, "Something went Wrong!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const autoLogin = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        if (customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined) {
            return responseWithoutData(res, 201, false, "Credentials is invalid!");
        }
        // const token = totp(customer?.totpKey);
        // const login = await zerodhaLogin(
        //     customer?.apiKey,//"Public API Key",
        //     customer?.apiSecret,//"Secret API Key",
        //     customer?.clientId,//"Client ID",
        //     customer?.clientPassword,//"Client Password",
        //     token //"Totp"
        // );
        // await User.findByIdAndUpdate(customer?._id,{$set:{
        //     requestToken:login?.requestToken,
        //     accessToken:login?.accessToken
        // }});
        if (await zerodhaAutoLogin(customer)) {
            return responseWithoutData(res, 200, true, "Auto Login Successfull!");
        } else {
            return responseWithoutData(res, 201, false, "Something went Wrong!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const instumentData = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        if (customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined) {
            return responseWithoutData(res, 201, false, "Zerodha Api Credentials is empty,update First!");
        }
        let accessToken = customer?.accessToken;
        if (customer?.accessToken == undefined || customer?.accessToken == '' || customer?.accessToken == null) {
            accessToken = await zerodhaAutoLogin(customer);
        }
        customer = { ...customer?._doc, accessToken: accessToken };
        const kite = new KiteConnect({ api_key: customer?.apiKey });

        // Set the access token
        kite.setAccessToken(customer?.accessToken);
        // Fetch all instruments
        const instruments = await kite.getInstruments();
        // Filter instruments for NIFTY 50 options of the current expiry
        const nifty50OptionInstruments = instruments.filter(
            (instrument) =>
                instrument.exchange === "NSE" &&
                // instrument.segment === "OPT" &&
                instrument.tradingsymbol.startsWith("NIFTY") &&
                instrument.tradingsymbol.includes("50")
            // instrument.expiry === "2023-11-30" // Replace with the actual current expiry
        );
        //required Fields Start 

        // Prepare data for CSV
        //   const csvData = nifty50OptionInstruments.map((instrument) => ({
        //     tradingSymbol: instrument.tradingsymbol,
        //     instrumentToken: instrument.instrument_token,
        //     expiryDate: instrument.expiry,
        //     lotSize: instrument.lot_size,
        //   }));
        //required Fields end
        return responseWithData(res, 200, true, "NIFTY 50 Instrument Data get Successfully!", nifty50OptionInstruments);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const historicalData = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        if (customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined) {
            return responseWithoutData(res, 201, false, "Zerodha Api Credentials is empty,update First!");
        }
        let accessToken = customer?.accessToken;
        if (customer?.accessToken == undefined || customer?.accessToken == '' || customer?.accessToken == null) {
            accessToken = await zerodhaAutoLogin(customer);
        }
        customer = { ...customer?._doc, accessToken: accessToken };
        // const instrument_token = '258825';
        // const interval = 'day';
        // const fromDate = '2023-01-01';
        // const toDate = '2023-12-31';
        const { instrument_token, interval, fromDate, toDate } = req?.body;
        const historicalData = await zerodhaApiCall(customer, "get", `https://api.kite.trade/instruments/historical/${instrument_token}/${interval}?from=${fromDate}&to=${toDate}`);
        if (historicalData?.status == 'error') {
            return responseWithData(res, 201, false, historicalData?.message);
        }
        let dataWithRequiredFormat = [];
        for (let index in historicalData?.data?.candles) {
            let dataSet = historicalData?.data?.candles[index];
            dataWithRequiredFormat.push({ date: dataSet?.[0], open: dataSet?.[1], high: dataSet?.[2], low: dataSet?.[3], close: dataSet?.[4], volume: dataSet?.[5] });
        }
        let vwap = await calculateVWAP(historicalData?.data?.candles);
        let ema12 = await calculateEMA12(historicalData?.data?.candles);
        let volsma20 = await calculateVOLSMA20(historicalData?.data?.candles);
        return responseWithData(res, 200, true, "Historical Data get successfully!!", { history: dataWithRequiredFormat, vwap: { date: new Date(), vwap: vwap }, ema12: ema12, volsma20: volsma20 });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const ltpNifty50 = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        if (customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined) {
            return responseWithoutData(res, 201, false, "Zerodha Api Credentials is empty,update First!");
        }
        let accessToken = customer?.accessToken;
        if (customer?.accessToken == undefined || customer?.accessToken == '' || customer?.accessToken == null) {
            accessToken = await zerodhaAutoLogin(customer);
        }
        customer = { ...customer?._doc, accessToken: accessToken };
        const kite = new KiteConnect({ api_key: customer?.apiKey });
        // Set the access token
        kite.setAccessToken(customer?.accessToken);
        const instruments = await kite.getInstruments();
        // Filter instruments for NIFTY 50 options of the current expiry
        // const nifty50OptionInstruments = instruments.filter(
        // (instrument) =>
        //     instrument.exchange === "NSE" &&
        //     // instrument.segment === "OPT" &&
        //     instrument.tradingsymbol.startsWith("NIFTY 50")
        // );
        //     res.send(nifty50OptionInstruments);
        const nifty50PutOptions = instruments.filter((instrument) =>
            instrument.exchange === "NSE" && instrument.tradingsymbol.startsWith('NIFTY') && instrument.tradingsymbol.includes("50") && instrument.instrument_type === 'PE'
        );
        const nifty50Instrument = instruments.find((instrument) => instrument.exchange === "NSE" && instrument.tradingsymbol.startsWith("NIFTY") && instrument.tradingsymbol.includes("50"));
        const ltpData = await kite.getLTP([nifty50Instrument?.instrument_token]);

        // Assuming data structure. Adjust accordingly based on the actual response.
        const ltp = ltpData[nifty50Instrument.instrument_token].last_price;
        // const ltp = {
        //     "instrument_token": 256265,
        //     "last_price": 20133.15
        // };
        // const ltp =  20133.15;
        // console.log(nifty50CallOptions);
        // console.log(nifty50PutOptions);
        nifty50Instrument.instrument_token = 408065;
        // Find ATM strikes
        const atmCallStrike = await findNearestStrike('CE', nifty50Instrument.instrument_token, ltp, kite);
        const atmPutStrike = await findNearestStrike('PE', nifty50Instrument.instrument_token, ltp, kite);

        // Find ATM+50 CE and ATM-50 PE strikes
        const atmPlus50CE = await findNearestStrike('CE', nifty50Instrument.instrument_token, ltp + 50, kite);
        const atmMinus50PE = await findNearestStrike('PE', nifty50Instrument.instrument_token, ltp - 50, kite);

        // console.log(`LTP of Nifty 50: ${ltp}`);
        // console.log(`ATM Call Strike: ${atmCallStrike}`);
        // console.log(`ATM Put Strike: ${atmPutStrike}`);
        // console.log(`ATM+50 CE Strike: ${atmPlus50CE}`);
        // console.log(`ATM-50 PE Strike: ${atmMinus50PE}`);
        res.send({ ltp, atmCallStrike, atmPutStrike, atmPlus50CE, atmMinus50PE });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Helper function to find the nearest strike
async function findNearestStrike(optionType, instrumentToken, targetPrice, kite) {
    try {
        // console.log(`${instrumentToken}:${optionType}`);
        const optionData = await kite.getLTP(`${instrumentToken}`);

        // Assuming data structure. Adjust accordingly based on the actual response.
        const nearestStrike = optionData[`${instrumentToken}:${optionType}`].last_price;

        return nearestStrike ? nearestStrike : null;
    } catch (error) {
        console.error(`Error finding nearest strike: ${error.message}`);
        return null;
    }
}

export const realTimeLtpNifty50 = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        if (customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined) {
            return responseWithoutData(res, 201, false, "Zerodha Api Credentials is empty,update First!");
        }
        let accessToken = customer?.accessToken;
        if (customer?.accessToken == undefined || customer?.accessToken == '' || customer?.accessToken == null) {
            accessToken = await zerodhaAutoLogin(customer);
        }
        customer = { ...customer?._doc, accessToken: accessToken };
        const kite = new KiteConnect({ api_key: customer?.apiKey });
        // Set the access token
        kite.setAccessToken(customer?.accessToken);
        const instruments = await kite.getInstruments();
        const nifty50PutOptions = instruments.filter((instrument) =>
            instrument.exchange === "NSE" && instrument.tradingsymbol.startsWith('NIFTY') && instrument.tradingsymbol.includes("50") && instrument.instrument_type === 'PE'
        );
        const nifty50Instrument = instruments.find((instrument) => instrument.exchange === "NSE" && instrument.tradingsymbol.startsWith("NIFTY") && instrument.tradingsymbol.includes("50"));
        const nifty50Symbol = "NSE:NIFTY 50";
        const atmOffset = 50; // Offset for ATM+50 CE and ATM-50 PE
        // const nifty50Symbol = nifty50Instrument?.instrument_token;
        // console.log(nifty50Symbol);
        //const ltpData = await kite.getLTP([nifty50Instrument?.instrument_token]);
        // console.log(ltpData);
        // console.log(await  kite.getLTP([nifty50Symbol]));
        kite.getLTP([nifty50Symbol]).then(async (data, err) => {
            // console.log("err",err);
            // console.log("data",data);
            if (err) {
                console.error("Error fetching Nifty 50 LTP:", err);
            } else {
                let nifty50LTP = data[nifty50Symbol].last_price;
                //   console.log("Nifty 50 LTP:", nifty50LTP);
                nifty50LTP = Math.round(nifty50LTP / 50) * 50
                // Calculate instrument token numbers for identified strike prices
                const atmCeInstrument = 'NFO:NIFTY23DEC' + nifty50LTP + 'CE';
                const atmPeInstrument = 'NFO:NIFTY23DEC' + nifty50LTP + 'PE';
                const atmPlus50CeInstrument = 'NFO:NIFTY23DEC' + (Number(nifty50LTP) + Number(atmOffset)) + 'CE';
                const atmMinus50PeInstrument = 'NFO:NIFTY23DEC' + (Number(nifty50LTP) - Number(atmOffset)) + 'PE';

                //   console.log("ATM CE Instrument Token:", atmCeInstrument);
                //   console.log("ATM PE Instrument Token:", atmPeInstrument);
                //   console.log("ATM+50 CE Instrument Token:", atmPlus50CeInstrument);
                //   console.log("ATM-50 PE Instrument Token:", atmMinus50PeInstrument);

                // Fetch real-time tick data for identified strike prices
                fetchRealTimeData(atmCeInstrument, atmPeInstrument, atmPlus50CeInstrument, atmMinus50PeInstrument);
            }
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Function to fetch real-time tick data for identified strike prices
const fetchRealTimeData = (...instrumentTokens) => {
    return new Promise((resolve, reject) => {
        kite.getLTP(instrumentTokens).then((data, err) => {
            if (err) {
                console.error("Error fetching real-time data:", err);
            } else {
                // Extract last prices from the response
                const ltp1 = data[instrumentTokens[0]].last_price;
                const ltp2 = data[instrumentTokens[1]].last_price;
                const ltp3 = data[instrumentTokens[2]].last_price;
                const ltp4 = data[instrumentTokens[3]].last_price;

                // console.log("LTP1:", ltp1);
                // console.log("LTP2:", ltp2);
                // console.log("LTP3:", ltp3);
                // console.log("LTP4:", ltp4);

                // Store the last prices in variables for further use in your strategy
                // You can use these variables for implementing your trading strategy
                // const LTP1 = ltp1;
                // const LTP2 = ltp2;
                // const LTP3 = ltp3;
                // const LTP4 = ltp4;
                resolve(data);
            }
        }).catch((err) => {
            console.log(err);
            reject(err?.response?.data);
        });
    });
};


//Record History Start
export const recordHistory = async (req, res) => {
    try {
        let totalCount = await DataRecord.find({ isActive: true }).count();
        let dataRecord = [];
        let limit = 10;
        if (req?.body?.page != undefined) {
            let skip = (req?.body?.page - 1) * 10;
            dataRecord = await DataRecord.find({ isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        } else {
            dataRecord = await DataRecord.find({ isActive: true }).sort({ createdAt: -1 });
        }
        if (dataRecord.length == 0) {
            return responseWithoutData(res, 201, false, "No Data Record Available!!");
        }
        return responseWithData(res, 200, true, "Record Data has been get Successfully!!", { count: totalCount, list: dataRecord });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}
//Record History End



const userData = await User.findOne({ isActive: true }).sort({ createdAt: 1 });
// let totpData = totp(userData?.totpKey);
// let loginSuccess = await zerodhaLoginCustomize(userData?.apiKey,userData?.apiSecret,userData?.clientId,userData?.clientPassword,totpData);  
const apiKey = userData?.apiKey;
const apiSecret = userData?.apiSecret;
const accessToken = userData?.accessToken; // Obtain this during the authentication process
const instrumentTokens = [256265]; // Replace with your instrument tokens
// const historicalDataPath = './historical_data/';
const clientId = userData?.clientId;
const clientPassword = userData?.clientPassword;
const totpKey = userData?.totpKey;

const kite = new KiteConnect({
    api_key: apiKey,
    access_token: accessToken,
});
const ticker = new KiteTicker({
    api_key: apiKey,
    access_token: accessToken,
});
// await zerodhaApiCall(userData,"get",`https://api.kite.trade/quote?i=256265`);    


const onTicks = async (ticks) => {
    // console.log(ticks);
    for (let dataIndex in ticks) {
        let tick = ticks[dataIndex];
        let checkRecord = await DataRecord.findOne({ instrument_token: tick?.instrument_token }).sort({ createdAt: -1 });
        if (checkRecord == null || (new Date(new Date(checkRecord?.createdAt)).setMinutes(checkRecord?.createdAt.getMinutes() + 2) <= new Date())) {
            // console.log("Ticks", ticks);
            // console.log("first");
            let instrument_token = tick?.instrument_token;
            let interval = "5minute";
            let fromDate = new Date();
            let toDate = new Date(fromDate);
            toDate = toDate.setDate(toDate.getDate() + 30);
            fromDate = await currentTimeStamp(fromDate);
            toDate = await currentTimeStamp(toDate);
            const historicalData = await zerodhaApiCall({ apiKey, apiSecret, accessToken, clientId, clientPassword, totpKey }, "get", `https://api.kite.trade/instruments/historical/${instrument_token}/${interval}?from=${fromDate}&to=${toDate}`);
            let ltp = await calculateLtp(instrument_token);
            let vwap = await calculateVWAP(historicalData?.data?.candles);
            let ema12 = await calculateEMA12(historicalData?.data?.candles);
            let volsma20 = await calculateVOLSMA20(historicalData?.data?.candles);
            let dataSave = { ...tick, ltp: ltp, vwap: vwap, ema12: ema12, volsma20: volsma20 };
            // console.log('recordId : ',recordId);
            let ltpInstrumentToken = Object.keys(ltp).map((key) => (ltp?.[key]?.instrument_token != undefined ? ltp?.[key]?.instrument_token : ltp?.[key]));
            // console.log(ltpInstrumentToken);
            let c = 1;
            for (let ltpToken in ltpInstrumentToken) {
                if (ltpToken == 0) continue;
                ltpToken = ltpInstrumentToken?.[ltpToken];
                let ltpData = await zerodhaApiCall({ apiKey, apiSecret, accessToken, clientId, clientPassword, totpKey }, "get", `https://api.kite.trade/quote?i=${ltpToken}`);
                const historicalData = await zerodhaApiCall({ apiKey, apiSecret, accessToken, clientId, clientPassword, totpKey }, "get", `https://api.kite.trade/instruments/historical/${ltpToken}/${interval}?from=${fromDate}&to=${toDate}`);
                // console.log(historicalData);
                // let ltp =  await calculateLtp(instrument_token);
                let vwap = await calculateVWAP(historicalData?.data?.candles);
                let ema12 = await calculateEMA12(historicalData?.data?.candles);
                let volsma20 = await calculateVOLSMA20(historicalData?.data?.candles);
                let dataCombination = { ...ltpData?.data, vwap, ema12, volsma20 };
                dataSave = { ...dataSave, ['ltp' + c]: dataCombination };
                // console.log(ltpToken);
                c++;
            }
            await DataRecord.create(dataSave);
        }
    }

}

const subscribe = () => {
    // var items = [256265];
    ticker.subscribe(instrumentTokens);
    ticker.setMode(ticker.modeFull, instrumentTokens);
}
// // Subscribe to real-time tick data for the specified instruments



//Calculate Ltp of Nifty50
const calculateLtp = async (nifty50Symbol) => {
    // const nifty50Symbol = "NSE:NIFTY 50";
    return new Promise((resolve, reject) => {
        const atmOffset = 50; // Offset for ATM+50 CE and ATM-50 PE
        kite.getLTP([nifty50Symbol]).then(async (data, err) => {
            if (err) {
                console.error("Error fetching Nifty 50 LTP:", err);
            } else {
                let nifty50LTP = data?.[nifty50Symbol]?.last_price;
                // console.log("Nifty 50 LTP:", nifty50LTP);
                nifty50LTP = Math.round(nifty50LTP / 50) * 50
                // let currentDate = new Date((new Date()).setMonth((new Date()).getMonth()+1));
                let currentDate = new Date();
                // currentDate = currentDate.setMonth(currentDate.getMonth()+1);
                let shortYear = ((currentDate.getFullYear()).toString()).slice(-2);
                let shortMonth = await monthInString(currentDate.getMonth());
                let shortSymbol = "NIFTY";
                let combinationSymbol = shortSymbol + '' + shortYear + '' + shortMonth;
                // Calculate instrument token numbers for identified strike prices
                const atmCeInstrument = 'NFO:' + combinationSymbol + '' + nifty50LTP + 'CE';
                const atmPeInstrument = 'NFO:' + combinationSymbol + '' + nifty50LTP + 'PE';
                const atmPlus50CeInstrument = 'NFO:' + combinationSymbol + '' + (Number(nifty50LTP) + Number(atmOffset)) + 'CE';
                const atmMinus50PeInstrument = 'NFO:' + combinationSymbol + '' + (Number(nifty50LTP) - Number(atmOffset)) + 'PE';
                // Fetch real-time tick data for identified strike prices
                const ltpData = await fetchRealTimeData(atmCeInstrument, atmPeInstrument, atmPlus50CeInstrument, atmMinus50PeInstrument);
                resolve({ "NSE:NIFTY 50": data[nifty50Symbol], ...ltpData });
            }
        }).catch((error) => {
            console.error("Error1:", error);
            reject(error?.response?.data);
        });
    });
}


// Function to calculate VWAP
const calculateVWAP = async (historicalData) => {
    return new Promise((resolve, reject) => {
        try {
            // Calculate VWAP
            let totalTypicalPriceVolume = 0;
            let totalVolume = 0;
            // 0 => timestamp ,1 => open, 2 =>high , 3 => low, 4 => close , 5=> volume
            for (let candle in historicalData) {
                candle = historicalData[candle];
                const typicalPrice = (Number(candle?.[2]) + Number(candle?.[3]) + Number(candle?.[4])) / 3;
                totalTypicalPriceVolume += Number(Number(typicalPrice) * Number(candle?.[5]));
                totalVolume += Number(candle?.[5]);
            };
            const vwap = totalTypicalPriceVolume / ((totalVolume > 0) ? totalVolume : 1);
            // console.log(`VWAP: ${vwap}`);
            resolve(vwap);
        } catch (error) {
            console.error("Error2:", error);
            reject(error);
        }
    });
}


// Function to calculate EMA12
const calculateEMA12 = async (historicalData) => {
    return new Promise((resolve, reject) => {
        try {
            const closePrices = historicalData?.map((candle) => candle);
            const ema12 = calculateEMA(closePrices, 12);

            // console.log("EMA12:", ema12);
            resolve(ema12);
        } catch (error) {
            console.error("Error3:", error);
            reject(error);
        }
    });
}

// Function to calculate Exponential Moving Average (EMA)
const calculateEMA = (data, period) => {
    let timeArray = data;
    data = data.map((d) => d?.[4]);
    // console.log(data);
    return new Promise((resolve, reject) => {
        const multiplier = 2 / (period + 1);

        // Calculate the Simple Moving Average (SMA) for the first data points
        let sma = 0;
        for (let i = 0; i < period; i++) {
            sma += data?.[i];
        }
        sma /= period;

        // Calculate EMA for the remaining data points
        const emaArray = [sma];
        for (let i = period; i < data?.length; i++) {
            const ema = (data?.[i] - emaArray[i - period]) * multiplier + emaArray[i - period];
            emaArray.push(ema);
        }
        const emaArrayWithTimeStamp = [];
        for (let j = 0; j < timeArray?.length; j++) {
            emaArrayWithTimeStamp.push({ date: timeArray?.[j]?.[0], ema12: emaArray[j] });
        }

        resolve(emaArrayWithTimeStamp);
    });
}


// Function to calculate VOLSMA20
const calculateVOLSMA20 = async (historicalData) => {
    return new Promise((resolve, reject) => {
        try {
            // Calculate VOLSMA20
            const volumeData = historicalData?.map((candle) => candle);
            const volsma20 = calculateSMA(volumeData, 20);

            // console.log("VOLSMA20:", volsma20);
            resolve(volsma20);
        } catch (error) {
            console.error("Error4:", error);
            reject(error);
        }
    });
}

// Function to calculate Simple Moving Average (SMA)
const calculateSMA = (data, period) => {
    let timeArray = data;
    data = data.map((d) => d?.[5]);
    // console.log('sma : ',data);
    return new Promise((resolve, reject) => {
        const smaArray = [];
        for (let i = 0; i < data?.length; i++) {
            if (i < period - 1) {
                // Not enough data points for SMA yet
                // smaArray.push(null);  
                smaArray.push(0);
            } else {
                // Calculate SMA for the current data point
                const sma = data.slice(i - period + 1, i + 1).reduce((sum, value) => sum + value, 0) / period;
                smaArray.push(sma);
            }
        }
        const smaArrayWithTimeStamp = [];
        for (let j = 0; j < timeArray?.length; j++) {
            smaArrayWithTimeStamp.push({ date: timeArray?.[j]?.[0], volsma20: smaArray[j] });
        }
        resolve(smaArrayWithTimeStamp);
    });
}

// Initialize Ticker for real-time data
ticker.connect();
ticker.on("ticks", onTicks);
ticker.on("connect", subscribe);



/********************************************** Zerodha Transaction Api Block Start ****************************************/

export const getOpenPosition = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        if (customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined) {
            return responseWithoutData(res, 201, false, "Zerodha Api Credentials is empty,update First!");
        }
        let accessToken = customer?.accessToken;
        if (customer?.accessToken == undefined || customer?.accessToken == '' || customer?.accessToken == null) {
            accessToken = await zerodhaAutoLogin(customer);
        }
        customer = { ...customer?._doc, accessToken: accessToken };
        const kite = new KiteConnect({ api_key: customer?.apiKey });

        // Set the access token
        kite.setAccessToken(customer?.accessToken);
        const symbol = "NSE:NIFTY 50"; // Replace with your Nifty50 strike price symbol
        const lotSize = 50;
        let ltp = await calculateLtp(symbol);
        let ltpInstrumentToken = Object.keys(ltp).map((key) => (ltp?.[key]?.instrument_token != undefined ? ltp?.[key]?.instrument_token : ltp?.[key]));
        // let ltpInstrumentToken = Object.keys(ltp).map((key) => key); 
        ltpInstrumentToken.shift();
        kite.getPositions({}).then(async (positions) => {
            // console.error("Success : ", positions,ltpInstrumentToken);
            let filterPosition = await checkExistance(ltpInstrumentToken, positions);
            // console.log(filterPosition);
            if (filterPosition.length > 0) {

            } else {
                for (let instrumentData in ltpInstrumentToken) {
                    let instrument_token = ltpInstrumentToken?.[instrumentData];
                    let interval = "5minute";
                    let fromDate = new Date();
                    let toDate = new Date(fromDate);
                    toDate = toDate.setDate(toDate.getDate() + 30);
                    fromDate = await currentTimeStamp(fromDate);
                    toDate = await currentTimeStamp(toDate);
                    let quoteData = await zerodhaApiCall(customer, "get", `https://api.kite.trade/quote?i=${instrument_token}`);
                    const historicalData = await zerodhaApiCall(customer, "get", `https://api.kite.trade/instruments/historical/${instrument_token}/${interval}?from=${fromDate}&to=${toDate}`);
                    let vwap = await calculateVWAP(historicalData?.data?.candles);
                    let volsma20 = await calculateVOLSMA20(historicalData?.data?.candles);
                    let volsma20Cal = 0;
                    volsma20.map((val) => (val != null) ? volsma20Cal += Number(val?.volsma20) : 0);
                    let closePrice = quoteData?.data?.[instrument_token]?.ohlc?.close;
                    let lowPrice = quoteData?.data?.[instrument_token]?.ohlc?.low;
                    let volume = quoteData?.data?.[instrument_token]?.volume;
                    // Check conditions and place order
                    if (closePrice > vwap && volume > volsma20Cal) {
                        const tradingSymbol = await getTradingSymbol(customer, instrument_token);
                        let orderRequestData = {
                            exchange: tradingSymbol?.exchange,
                            tradingsymbol: tradingSymbol?.tradingsymbol,
                            transaction_type: 'BUY',
                            quantity: lotSize,
                            product: "NRML",
                            order_type: "MARKET",
                            validity: "DAY",
                            // price:lotSize,
                            // disclosed_quantity:lotSize,
                            // trigger_price:lotSize,
                            // squareoff:lotSize,
                            stoploss: lowPrice,
                            trailing_stoploss: lowPrice,
                            // tag:lotSize,
                        }
                        kite.placeOrder("regular", orderRequestData).then(async (order) => {
                            let orderData = await Order.create({
                                userId: customer?._id,
                                order_id: order?.order_id,
                                tradingsymbol: tradingSymbol?.tradingsymbol,
                                transaction_type: 'BUY',
                                quantity: lotSize,
                                status: "PENDING",
                                exchange: tradingSymbol?.exchange,
                                stoploss: lowPrice,
                                trailing_stoploss: lowPrice
                            });
                            console.log('tradingSymbol : ', order);
                            //return responseWithData(res,200,true,`${tradingSymbol?.tradingsymbol} Position Opened Successfully with stoploss!`);
                        }).catch((error) => {
                            console.log('tradingSymbol error : ', error);
                            //return responseWithoutData(res, 201, false, `${tradingSymbol?.tradingsymbol} Order Rejected ! ${error?.message}`);
                        });

                        //console.log('passCondition : ',volsma20Cal,closePrice,volume);
                        // placeMarketBuyOrder();
                    }
                }
                return responseWithData(res, 200, true, `Position Opened Successfully with stoploss!`);
            }
        }).catch((error) => {
            console.error("Error fetching positions : ", error);
            return responseWithoutData(res, 201, false, error?.message);
        });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const checkBuyOrder = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if (!customer) {
            return responseWithoutData(res, 201, false, "Invalid User or session is invalid!");
        }
        if (customer?.apiKey == undefined || customer?.apiSecret == undefined || customer?.clientId == undefined || customer?.clientPassword == undefined || customer?.totpKey == undefined) {
            return responseWithoutData(res, 201, false, "Zerodha Api Credentials is empty,update First!");
        }
        let accessToken = customer?.accessToken;
        if (customer?.accessToken == undefined || customer?.accessToken == '' || customer?.accessToken == null) {
            accessToken = await zerodhaAutoLogin(customer);
        }
        customer = { ...customer?._doc, accessToken: accessToken };
        const kite = new KiteConnect({ api_key: customer?.apiKey });

        // Set the access token
        kite.setAccessToken(customer?.accessToken);
        let order_info = await kite.getOrders();
        let responseMessage = [];
        for (let order in order_info) {
            let orderDetail = order_info?.[order];
            await Order.findOneAndUpdate({ order_id: orderDetail?.order_id }, {
                $set: {
                    ...orderDetail
                }
            });
            if (orderDetail?.status == 'REJECTED') {
                responseMessage.push(`${orderDetail?.tradingsymbol} Order Rejected ! ${orderDetail?.status_message}`);
            } else {
                responseMessage.push(`${orderDetail?.tradingsymbol} Position Opened Successfully with stoploss!`);
            }
        }
        // res.send(order_info);
        return responseWithData(res, 200, true, `Order Information Message Get Successfully!`, { orderData: order_info, responseMessage: responseMessage });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

/************************************************ Zerodha Transaction Api Block End ****************************************/



