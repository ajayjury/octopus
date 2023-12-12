import mongoose from "mongoose";
import { DB_HOST, DB_PORT, DB_NAME } from "./config.js";

export default mongoose.connect('mongodb://'+DB_HOST+':'+DB_PORT+'/'+DB_NAME+'')
  .then(() => console.log('Database Connected Successfully!'));