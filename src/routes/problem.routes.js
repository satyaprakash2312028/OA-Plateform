// src/routes/problem.routes.js
const express = require("express");
const { protectRoute } = require("../middleware/auth.middleware.js");
const { getProblem, submitProblem, getSubmissions, getOAssessments, submitMcq } = require("../controllers/problem.controller.js");

const router = express.Router();

router.post("/submitProblem/:id", protectRoute, submitProblem);
router.post("/submitMcq", protectRoute, submitMcq);
router.get("/submissions", protectRoute, getSubmissions);
router.get("/assessment/:id", protectRoute, getOAssessments);
router.get("/getProblem/:id", protectRoute, getProblem);
// Add other routes here...

module.exports = { router: router };