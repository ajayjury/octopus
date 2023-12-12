import { Schema, model } from "mongoose";

const uploadSchema = Schema({
    fileName        : { type: String, required: true , index: true },
    filePath        : { type: String, },
    relatedWith     : { type: String, required: true ,  index: true },
    relatedId       : { type: Schema.Types.ObjectId, default:null ,  index: true},
    addedBy         : { type: Schema.Types.ObjectId, required: true, index: true  },
    isDeleted       : { type: Boolean, default:false, index: true },
}, { timestamps: true });

export default model('upload', uploadSchema);