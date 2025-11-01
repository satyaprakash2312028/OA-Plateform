// src/routes/problem.routes.js
const express = require("express");
const { protectRoute } = require("../middleware/auth.middleware.js");
const { submitProblem, getSubmissions, getOAssessments, submitMcq } = require("../controllers/problem.controller.js");

const router = express.Router();

router.post("/submit", protectRoute, submitProblem);
router.post("/submitMcq", protectRoute, submitMcq);
router.post("/submitMcq", protectRoute, submitProblem);
router.get("/submissions", protectRoute, getSubmissions);
router.get("/assessment/:id", protectRoute, getOAssessments);
// Add other routes here...

module.exports = { router: router };