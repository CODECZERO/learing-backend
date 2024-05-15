import { asyncHandler } from '../utils/asyncHanderl.js';
import { ApiError } from '../utils/apiErrHandelr.js';
import { user } from "../models/user.model.js";
import { uploadOncloud } from '../utils/fileUplode.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';


const options = { //gobal options for cookies
    httpOnly: true,
    secure: true
}

const generateAccessandRefershtoken = async (userId) => {
    try {
        const findUserById = await user.findById(userId);
        const genAccessToken = await findUserById.genrateAccesToken();
        const genRefershToken = await findUserById.genrateRefershToken();

        findUserById.refferToken = genRefershToken;
        await findUserById.save({ validateBeforeSave: false });

        return { genAccessToken, genRefershToken }
    } catch (error) {
        throw new ApiError(500, "Unable to make refersh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {


    //Taking request /payload from user in the backend and the spearting them
    const { userName, email, fullName, password } = req.body;
    console.log(userName)
    //checking if values are  empty or not
    if ([userName, email, fullName, password].some((filed) => { filed?.trim() === "" })) {
        throw new ApiError(400, "All fileds are required");
    }

    //findig the user by email or userName to check if existes or not 
    const existUser = await user.findOne({ $or: [{ email }, { userName }] });

    //ApiError is pre mad program made by use to handle error and it is import from utils apiErrHandler file 
    if (existUser) {
        throw new ApiError(409, "User/Email existes")
    }


    //Handling file

    const avatarLocal = req.files?.avatar[0]?.path;
    let coverImage = "";
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImage = req.files.coverImage[0].path;
    }
    //error handling
    if (!avatarLocal) {
        throw new ApiError(409, "Avatar/coverImage Image missing 1");
    }

    const avtarRef = await uploadOncloud(avatarLocal);
    //const coverImageRef = await uploadOncloud(coverImageLocal);

    if (!avtarRef) {
        throw new ApiError(409, "Avatar/coverImage Image missing 2");
    }


    //creating object/data in database
    const userDatabaseCreate = await user.create({
        userName: userName.toLowerCase(),
        fullName,
        avtar: avtarRef.url,
        //coverImage: coverImageRef.url,
        email: email.toLowerCase(),
        password,

    })
    //storing it on the variable
    const confirmdata = await user.findById(userDatabaseCreate._id).select("-password -refferToken");

    //checking if database has been created
    if (!confirmdata) {
        throw new ApiError(500, "user not create");
    }

    //sending data /response

    return res.status(201).json(new apiResponse(
        200
        , confirmdata
        , "user Created Successful"
    ));

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body;
    if (!(email || userName)) {
        throw new ApiError(400, "Email or username is missing");
    }
    password
    const findUser = await user.findOne({ $or: [{ email }, { userName }] }); //this holds all function you have made in the database becasuse it is the inscatins of the object
    if (!findUser) {
        throw new ApiError(400, "email or username does not existes in the database")
    }
    const passwordCheck = await findUser.isPasswordCorrect(password);//findUser holds all the function/methods you have made in db of it is insctance of object so it have access to the methodes 

    if (!passwordCheck) {
        throw new ApiError(400, "please enter correct password")
    }

    const { genAccessToken, genRefershToken } = await generateAccessandRefershtoken(findUser._id);


    const loginUser = await user.findById(findUser._id).select("-password -refferToken");


    return res.status(200).cookie("accessToken", genAccessToken, options).cookie("refferToken", genRefershToken, options).json(new apiResponse(200, {
        user: loginUser
    }, "user login succefully"
    ))
})


const logout = asyncHandler(async (req, res) => {
    await user.findByIdAndUpdate(req.user._id, {
        $set: {
            refferToken: undefined
        }
    },
        {
            new: true
        })

    return res.status(200).clearCooki("AccessToken", options).clearCooki("refferToken", options).json(new apiResponse(200, {}, "user logout"))
})

const refershAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingToken = await req.cookies.refferToken || req.body.refferToken;
        if (!incomingToken) {
            throw new ApiError(401, "invalid refersh token")
        }

        const decodeVerify = await jwt.verify(incomingToken, process.env.REFERSH_TOKEN);

        const userFind = await user.findById(decodeVerify?._id);

        if (!userFind) {
            throw new ApiError(400, "invalid refersh token ");
        }
        if (!(incomingToken === userFind?.refferToken)) {
            throw new ApiError(400, "refersh token is expried")
        }
        const { genAccessToken, genRefershToken } = await generateAccessandRefershtoken(userFind._id);

        return res.status(200).cookie("accessToken", genAccessToken, options)
            .cookie("refferToken", genRefershToken, options)
            .json(new apiResponse(200, { genAccessToken, genRefershToken }, "access token refersed successfuly"));

    } catch (error) {
        throw new ApiError(500, error?.message || "invalid refersh token")
    }
})

const chageCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userFind = await user.findById(req.user?._id);
    const passwordCheck = await user.isPasswordCorrect(oldPassword);
    if (!passwordCheck) {
        throw new ApiError(400, "invalid password")
    }

    userFind.password = newPassword;
    await userFind.save({ validateBeforeSave: false });

    return res.status(200).json(new apiResponse(200, {}, "password change succesfully"));


})

const currentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(200, req.user, "current user found successfuly");
})

const updateProfile = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body;
    if (!(email || fullName === "")) {
        throw new ApiError(200, "Email or full name is required");
    }

    const user = await user.findByIdAndUpdate(req.user?._id, { $set: { email, fullName } }, { new: true }).select("-password -refferToken");
    return res.status(200).json(new apiResponse(200, { user }, "user info updated"));
})

const updateProfileImage = asyncHandler(async (req, res) => {

    const avtar = req.file?.avatar[0]?.path;
    if (!avtar) {
        throw new ApiError(400, "no image")
    }

    const avtarRef = await uploadOncloud(avtar);
    if (!avtarRef) {
        throw new ApiError(400, "Error while uploding image")
    }

    await cloudinary.v2.api.delete_resources([req.user?.avtar],
        { type: 'upload', resource_type: 'image' }).then(console.log);

    const userAvtar = await findByIdAndUpdate(req.user?._id, { $set: { avtar: avtarRef.url } }, { new: true }).select("-password -refferToken")
    return res.status(200).json(new apiResponse(200,userAvtar ,"profile Update successfully"));
})
const updateCoverImage=asyncHandler(async (req,res)=>{
    const coverImage = req.file?.coverImage[0]?.path;
    if (!coverImage) {
        throw new ApiError(400, "no image")
    }

    const coverImageRef = await uploadOncloud(coverImage);
    if (!coverImageRef) {
        throw new ApiError(400, "Error while uploding image")
    }

    await cloudinary.v2.api.delete_resources([req.user?.coverImage],
        { type: 'upload', resource_type: 'image' }).then(console.log);

    const userAvtar = await findByIdAndUpdate(req.user?._id, { $set: { coverImage: coverImageRef.url } }, { new: true }).select("-password -refferToken")
    return res.status(200).json(new apiResponse(200,userAvtar ,"profile Update successfully"));
})
export {
    registerUser,
    loginUser,
    logout,
    refershAccessToken,
    chageCurrentPassword,
    currentUser,
    updateProfile,
    updateProfileImage,
    updateCoverImage
};