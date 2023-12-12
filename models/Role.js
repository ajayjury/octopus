import { model, Schema } from "mongoose";

const roleSchema = Schema({
    name        : { type : String , required: true, index : true },
    addedBy     : { type : Schema.Types.ObjectId , required: true, index : true},
    isActive      : { type : Boolean , default:true,  index : true },
    isDeleted    : { type : Boolean , default:false, index : true },
}, {timestamps: true})

export default model('role', roleSchema);