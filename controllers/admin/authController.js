import User from "../../models/User.js";
//import bcrypt from "bcrypt";
import { errorResponse, getJwtToken } from "../../helpers/helper.js";
import { errorLog } from "../../config/logger.js";

export const adminLogin = async (req, res) => {
    try {
        // Find a user with the provided email
        let admin = await User.findOne({ email: req.body.email, type: 'admin' });

        if (admin) {
            // Compare the provided password with the stored hashed password
            //let comparePassword = await bcrypt.compare(req.body.password, admin.password);

            if (comparePassword) {
                // Passwords match, send a success response with a JWT token
                res.status(200).send({
                    status: true,
                    msg: "Admin Logged In Successfully",
                    token: getJwtToken(admin._id),
                });
            } else {
                // Passwords don't match, send an "Invalid Credentials" error response
                res.status(403).send({
                    status: false,
                    msg: "Invalid Credentials",
                });
            }
        } else {
            // No user found with the provided email, send an "Invalid Credentials" error response
            res.status(403).send({
                status: false, 
                msg: "Invalid Credentials",
            });
        }
    } catch (error) {
        errorLog(error)
        errorResponse(res);
    }
}