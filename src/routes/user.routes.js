import { Router } from "express";
import { loginUser, logout, refershAccessToken, registerUser } from "../controllers/user.controller.js";
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

router.route("/refershtoken").post(refershAccessToken)

    export default router;