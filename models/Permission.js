import { model, Schema } from "mongoose";

const permissionSchema = Schema({
    roleId         :   { type : Schema.Types.ObjectId ,index : true, unique: true},
    menus          :   { type : Array ,index : true},
    addedBy       :   { type : String ,index : true},
    isDeleted      :   { type : Number ,index : true},
});

export default model('permission', permissionSchema);