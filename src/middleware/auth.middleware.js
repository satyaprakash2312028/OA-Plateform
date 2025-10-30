const dotenv =  require("dotenv")
const jwt = require("jsonwebtoken")
const {User} =  require("../models/user.model.js");
dotenv.config();
const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) return res.status(401).json({message: "Unauthorized Access - No token provided"});
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({message: "Unauthorized Access - Invalid Token"});
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) return res.status(404).json({message: "User Not Found"});
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in auth middleware ", error);
    }
};
const requiresVerified = (req, res, next) => {
    try {
        if(!req.user.isVerified) return res.status(403).json({message: "Verify your email account first"});
        next();
    } catch (error) {
        console.log("Error in requiresVerified middleware", error);
    }
}
const internalRouteChecks = (req, res, next) => {
    try{
        const secret = req.headers['X-Internal-Secret'];
        if(!secret || secret !== process.env.WORKER_SECRET_KEY){
            return res.status(401).json({message: "Unauthorized Access - Invalid Internal Secret"});
        }else{
            next();
        }
    }catch(error){
        console.log("Error in internalRouteChecks middleware", error);
    }
}

module.exports = {protectRoute, requiresVerified, internalRouteChecks};