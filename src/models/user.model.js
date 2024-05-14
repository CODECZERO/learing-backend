import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        require: true,
        trim: true,
        index: true
    },
    avtar: {
        type: String,
        require: true,//cloud url
    },
    coverImage: {
        type: String
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "video"
    }],
    password: {
        type: String,
        require: [true, "password is required "]
    },
    refferToken: {
        type: String
    }

}, { timestamps: true });

//encrypting the password only if password chages 
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next
    }
    else {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
})

//method to check encrypt password by decrtypting it 
userSchema.methods.isPasswordCorrect = async function (password) {
    if (password) {
        return await bcrypt.compare(password, this.password)
    }
    else {
        return next
    }
}

//generate access token
userSchema.methods.genrateAccesToken = async function () {
    return await jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_TIME
        })
}
//genrate refersh token
userSchema.methods.genrateRefershToken = async function () {
    return await jwt.sign({
        _id: this._id,
    },
        process.env.REFERSH_TOKEN,
        {
            expiresIn: process.env.REFERSH_TOKEN_TIME
        })
}
export const user = mongoose.model('user', userSchema);
