const { Schema, model } = require("mongoose");
const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        isVerified: {
            type: Boolean,
            default: true
        },
        profilePic:{
            type: String,
            default:""
        },
        otp: {
            code: String,
            expiresAt: Date,
            resendAttemptsCount: {
                type: Number,
                default: 0
            },
            nextResendAttempt: Date,
            verificationAttemptsLeft: {
                type: Number,
                default: 12
            }

        },
    },
    {timestamps: true}
);

const User = model("User", userSchema);
module.exports = {User};