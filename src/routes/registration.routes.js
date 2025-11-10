const express = require("express");
const { protectRoute } = require("../middleware/auth.middleware.js");
const { register, getSelectedTeams} = require("../controllers/registration.controller.js");

const router = express.Router();

router.post("/register", protectRoute, register);
router.post("/getSelectedTeams", protectRoute, getSelectedTeams);
// Add other routes here...

module.exports = { router: router };