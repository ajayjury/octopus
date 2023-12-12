import express from "express";
import { body } from "express-validator";
export const adminRoute = express.Router();
export const adminAuthRoute = express.Router();



/***************************
        CUSTOM IMPORTS
 ****************************/
import { adminValiation, uploadImageValdator } from "../validation/adminValidation.js";
import { adminLogin } from "../controllers/admin/authController.js";
import { addMenus, adminMenusList, deleteMenus } from "../controllers/admin/menuController.js";
import { addRole, deleteRole, getRoleById, roleList, updateRole } from "../controllers/admin/roleController.js";
import { uploadImage } from "../controllers/admin/uploadController.js";
import { multerImageUpload } from "../config/config.js";
import { assignPermissionsToRole, getPermissionByRole } from "../controllers/admin/permissionController.js";
import { addAndUpdateValue, addType, getSettings } from "../controllers/admin/settingController.js";
import Setting from "../models/Setting.js";

/***************************
        Admin Login
***************************/

adminRoute.post('/login', [body('email', 'Email field is Required').notEmpty().isEmail(),
body('password', 'Password field is Required').notEmpty()], adminValiation,
  adminLogin);


/****************************
  ADMIN AUTHENTICATED ROUTES 
*****************************/

/************************  Menus Routes ************************/

adminAuthRoute.get('/menus-list', adminMenusList);
adminAuthRoute.post('/add-menus', [
  body('name', 'name feild is required').notEmpty(),
  body('url', 'url feild is required').notEmpty(),
  body('icon', 'icon feild is required').notEmpty(),
  body('parentId', 'parentId feild is required').optional(),
  body('sortOrder', 'sort order feild is required').notEmpty(),
  body('for', 'for feild is required').notEmpty().custom(async (value) => {
    if (value === 'customer' || value === 'admin') {
      return true;
    } else {
      throw new Error('for should only have "customer" and "admin"')
    }
  }),
], adminValiation, addMenus);

adminAuthRoute.delete('/soft-delete', [
  body("menuId", "Menu Id Field Is Required").notEmpty()
], adminValiation, deleteMenus);



/************************  ROLES ROUTES START ************************/

adminAuthRoute.get('/roles', roleList);

adminAuthRoute.post('/roles', [
  body('name', "Name field is Required").notEmpty(),
], adminValiation, addRole);

adminAuthRoute.get('/roles/:roleId', getRoleById);

adminAuthRoute.put('/roles', [
  body('roleId').notEmpty().withMessage("Role Id field is Required"),
  body('name').notEmpty().withMessage("Name field is Required"),
  body('isActive').optional(),
], adminValiation, updateRole);


adminAuthRoute.delete('/roles', [
  body('roleId').notEmpty().withMessage("Role Id field is Required"),
], adminValiation, deleteRole);

/************************  ROLES ROUTES END ************************/

/************************  PERMISSION ROUTES START ************************/

adminAuthRoute.post('/get-permission-by-role', getPermissionByRole);

adminAuthRoute.post("/assign-permissions", assignPermissionsToRole);

/************************  PERMISSION ROUTES END ************************/

/************************  UPLOADS ROUTES START ************************/

adminAuthRoute.post('/upload-image', multerImageUpload.single('image'), uploadImageValdator, uploadImage);

/************************  UPLOADS ROUTES END ************************/


/************************  SETTING ROUTES START ************************/

adminAuthRoute.get('/settings', getSettings);

adminAuthRoute.post('/settings/type', [
  body('type').notEmpty().withMessage('Type field is required').custom(async(type)=>{
    let setting = await Setting.findOne({ type });
    if(setting){
      throw new Error("Type is Already Exists");
    }
    return true
  })
], adminValiation, addType);

adminAuthRoute.post('/settings/value', [
  body('type').notEmpty().withMessage('Type field is required'),
  body('value').notEmpty().withMessage('Value field is required')
], adminValiation, addAndUpdateValue);

/************************  SETTING ROUTES END ************************/


