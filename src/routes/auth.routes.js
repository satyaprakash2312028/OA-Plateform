const express = require("express")
const { login, logout, signup, updateProfile, checkAuth, checkVerified } = require("../controllers/auth.controller.js");
const { protectRoute, requiresVerified } = require("../middleware/auth.middleware.js");
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, requiresVerified,  updateProfile);
router.get("/check", protectRoute, checkAuth);
router.get("/checkVerified", protectRoute, requiresVerified, checkVerified);
module.exports =  {router};