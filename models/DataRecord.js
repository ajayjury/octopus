import { model, Schema } from "mongoose";

const dataRecordSchema = Schema({
    // userId          : { type:String, index: true},
    instrument_token    : { type:String, index: true, default:null},
    tradingsymbol       : { type:String, index: true, default:null},
    name                : { type:String, index: true, default:null},
    tradable            : { type:String, index: true, default:null},
    mode                : { type:String, index: true, default:null},
    instrument_token    : { type:String, index: true, default:null},
    last_price          : { type:String, index: true, default:null},
    last_traded_quantity: { type:String, index: true, default:null},
    average_traded_price: { type:String, index: true, default:null},
    volume_traded       : { type:String, index: true, default:null},
    total_buy_quantity  : { type:String, index: true, default:null},
    change              : { type:String, index: true, default:null},
    last_trade_time     : { type:Date, index: true, default:null},
    exchange_timestamp  : { type:Date, index: true, default:null},
    ltp                 : { type:JSON, index: true, default:null},
    ltp1                : { type:JSON, index: true, default:null},
    ltp2                : { type:JSON, index: true, default:null},
    ltp3                : { type:JSON, index: true, default:null},
    ltp4                : { type:JSON, index: true, default:null},
    ohlc                : { type:JSON, index: true, default:null},
    oi                  : { type:String, index: true, default:null},
    oi_day_high         : { type:String, index: true, default:null},
    depth               : { type:JSON, index: true, default:null},
    vwap                : { type:String, index: true, default:null},
    ema12               : { type:Array, index: true, default:null},
    volsma20            : { type:Array, index: true, default:null},
    isActive            : { type:Boolean, default: true },
    isDeleted           : { type:Boolean, default: false }, 
},{timestamps:true});


export default model('data_records', dataRecordSchema); 