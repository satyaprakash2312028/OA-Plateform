const dotenv =  require("dotenv")
dotenv.config();

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

module.exports = {internalRouteChecks};