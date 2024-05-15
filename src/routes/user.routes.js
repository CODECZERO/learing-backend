import { Router } from "express";
import { chageCurrentPassword, currentUser, loginUser, logout, refershAccessToken, registerUser, updateProfile, updateProfileImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { veryfiJwt } from "../middlewares/auth.middleware.js";
const router =Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser);
//secure routers

router.route("/logout").post(veryfiJwt,logout);

router.route("/refershtoken").post(refershAccessToken);
router.route("/updateProfileImage").post(veryfiJwt,upload.fields,updateProfileImage);
router.route("/updateProfile").post(veryfiJwt,updateProfile);
router.route("/passwordUpdate").post(veryfiJwt,chageCurrentPassword);
router.route("/currentUser").post(veryfiJwt,currentUser);


export default router;