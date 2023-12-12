import { model, Schema } from "mongoose";

const instumentRecordSchema = Schema({
    // userId          : { type:String, index: true},
    instrument_token: { type:String, index: true},
    exchange_token  : { type:String, index: true},
    tradingsymbol   : { type:String, index: true},
    name            : { type:String, index: true},
    last_price      : { type:String, index: true},
    expiry          : { type:String, index: true},
    strike          : { type:String, index: true},
    tick_size       : { type:String, index: true},
    lot_size        : { type:String, index: true},
    instrument_type : { type:String, index: true},
    segment         : { type:String, index: true},
    exchange        : { type:String, index: true},
    isActive        : { type:Boolean, default: true },
    isDeleted       : { type:Boolean, default: false },
},{timestamps:true});


export default model('instument_records', instumentRecordSchema); 