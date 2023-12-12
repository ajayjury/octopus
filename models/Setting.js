import { model, Schema } from "mongoose";   

const settingSchema = new Schema({
    type    : { type:String, index: true, unique: true, required: true },
    value   : { type:Array, inde: true }
},{timestamps:true});   

export default model('setting', settingSchema);