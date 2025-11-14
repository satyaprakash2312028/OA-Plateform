// src/routes/problem.routes.js
const express = require("express");
const { protectRoute, requiresVerified } = require("../middleware/auth.middleware.js");
const { getProblem, submitProblem, getSubmissions, getOAssessments, submitMcq, allProblems } = require("../controllers/problem.controller.js");

const router = express.Router();

router.post("/submitProblem/:id", protectRoute, requiresVerified ,submitProblem);
router.post("/submitMcq", protectRoute, requiresVerified, submitMcq);
router.get("/submissions", protectRoute, requiresVerified, getSubmissions);
router.get("/assessment/:id", protectRoute, requiresVerified, getOAssessments);
router.get("/getProblem/:id", getProblem);
router.get("/allProblem", allProblems);
// Add other routes here...

module.exports = { router: router };