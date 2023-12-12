import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Role from "../../models/Role.js";

export const roleList = async (req, res) => {
    try {
        let roleList = await Role.find({ isDeleted: false });
        responseWithData(res, 200, true, "Role List Get Successfully", { roleList });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addRole = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let role = await Role.create({
            name: req.body.name,
            addedBy: user._id,
        });
        if (role) {
            responseWithoutData(res, 200, true, "Role Created Successfully");
        } else {
            responseWithoutData(res, 500, false, "Role Creation Failed.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getRoleById = async (req, res) => {
    try {
        let role = await Role.findOne({ _id:req.params.roleId, isDeleted:false });
        if (role) {
            // Role found
            responseWithData(res, 200, true, "Role Retrieved Successfully.", role);
        } else {
            // Role not found
            responseWithoutData(res, 404, false, "Role not found.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateRole = async (req, res) => {
    try {
        let role = await Role.findByIdAndUpdate(req.body.roleId, {
            name: req.body.name,
            isActive: req.body.isActive
        }, {new: true});
        if (role) {
            responseWithoutData(res, 200, true, "Role Update Successfully.");
        } else {
            responseWithoutData(res, 403, false, "Failed to Update Role");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteRole = async (req, res) => {
    try {
        let role = await Role.findOne({ _id: req.body.roleId, isDeleted:false });
        if (role) {
            if(await role.save()){
                responseWithoutData(res, 200, true, "Role Deleted Successfully.");
            }
            else {
                responseWithoutData(res, 403, false, "Failed to Delete Role");
            }
        } else{
            responseWithoutData(res, 404, false, "Role Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}
