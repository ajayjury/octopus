import express from "express";
import bodyParser from "body-parser";
import { PORT } from "./config/config.js"
import database from "./config/database.js";   // Database Connection load
import { api } from "./routes/api.js";
import totp from "totp-generator" ;
import zerodhaLogin from "zerodha-auto-login";
const app = express();

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use('/api', api);

/* Not Fround Handler 404 */
app.get('*', (req, res)=>{
    res.status(404).send({status: false, msg: "Not Found"})
});

app.post('*', (req, res)=>{
    res.status(404).send({status: false, msg: "Not Found"})
});

/* Application Lister */
app.listen(PORT,async ()=>{
    console.log(`Server is running on port ${PORT}`);
    // let text = `instrument_token,exchange_token,tradingsymbol,name,last_price,expiry,strike,tick_size,lot_size,instrument_type,segment,exchange
    // 537733638,2100522,EURINR23DEC83.25CE,"EURINR",0,2023-12-27,83.25,0.0025,1,CE,BCD-OPT,BCD
    // 537730310,2100509,EURINR23DEC83.25PE,"EURINR",0,2023-12-27,83.25,0.0025,1,PE,BCD-OPT,BCD
    // 537617158,2100067,EURINR23DEC83.5CE,"EURINR",0,2023-12-27,83.5,0.0025,1,CE,BCD-OPT,BCD`;
    // const myArray = text.split("\n    ");
    // console.log(myArray);
    // const token = totp("TDJYGDJ7GDQR7VFIHDRPPKZKVWHBY47Q");
    // console.log(token);    
    // const login = await zerodhaLogin(
    //     "covt43dshs0w6fen",//"Public API Key",
    //     "rkyt3wqiz592f65yfh2b3gsmvmpy6va5",//"Secret API Key",
    //     "KB0515",//"Client ID",
    //     "Octopus55#",//Client Password",
    //     token //totp
    // );
    
    // console.log(login)
});