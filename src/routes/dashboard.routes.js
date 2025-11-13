const express = require("express")
const { upcomingOA, allOATakenPartIn } = require("../controllers/dashboard.controller.js");
const { protectRoute, requiresVerified } = require("../middleware/auth.middleware.js");
const router = express.Router();

router.get("/upcomingHackathon", upcomingOA);
router.get("/totalContest",  protectRoute , requiresVerified, allOATakenPartIn);

module.exports = { router: router}