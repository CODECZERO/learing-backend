import { ApiError } from "../utils/apiErrHandelr.js";
import { asyncHandler } from "../utils/asyncHanderl.js";
import jwt from "jsonwebtoken";
import { user } from "../models/user.model.js";

export const veryfiJwt=asyncHandler(async (req,_,next)=>{
    try {
        const token=await req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer","")
        if (!token){
            throw new ApiError(401,"Unauthoriz access")
        }
        const decode = await jwt.verify(token,process.env.ACCESS_TOKEN)
        const userFind=await user.findById(decode?._id).select("-password -refferToken");
    
        if(!userFind){
            throw new ApiError(401,"invalid access token");
        }
    
        req.user=userFind;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message||"invaild access ")
    }

})