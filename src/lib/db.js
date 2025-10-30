const mongoose =  rquire("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb connected successfully ", conn.connection.host);
    } catch (error) {
        console.log(error);
    }
};
module.exports = {connectDB};