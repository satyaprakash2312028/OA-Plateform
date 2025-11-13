const dotenv =  require("dotenv")
const jwt = require("jsonwebtoken")
const {User} =  require("../models/user.model.js");
dotenv.config();
const protectAdminRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt_admin;
        if(!token) return res.status(401).json({message: "Unauthorized Access - No token provided"});
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({message: "Unauthorized Access - Invalid Token"});
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) return res.status(404).json({message: "User Not Found"});
        if(!user.isAdmin) return res.status(404).json({message: "User Don't have admin privelages"});
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in auth middleware ", error);
    }
};

module.exports = {protectAdminRoute};