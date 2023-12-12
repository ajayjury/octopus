import { model, Schema } from "mongoose";
const menuSchema = new Schema({
    name        :   { type : String ,index : true},
    url         :   { type : String ,index : true},
    icon        :   { type : String ,index : true},
    parentId :   { type : String ,index : true},
    sortorder   :   { type : Number ,index : true},
    status      :   { type : Number ,index : true},
    for         :   { type : String, default: 'customer' ,index : true},
    added_by    :   { type : String ,index : true}
},{timestamps:true});


export default model('menu', menuSchema);