const express = require("express")
const { upcomingOA, allOATakenPartIn, problemSolved } = require("../controllers/dashboard.controller.js");
const { protectRoute, requiresVerified } = require("../middleware/auth.middleware.js");
const router = express.Router();

router.get("/upcomingHackathon", upcomingOA);
router.get("/totalContest",  protectRoute , requiresVerified, allOATakenPartIn);
router.get("/problemSolved", protectRoute, requiresVerified, problemSolved)

module.exports = { router: router}