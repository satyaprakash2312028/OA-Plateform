// src/routes/internal.routes.js
const express = require("express");
const { internalRouteChecks } = require("../middleware/auth.middleware.js");
const { getJudgeVedict, getStatus } = require("../controllers/worker.controller.js");

const router = express.Router();

// Use the middleware to protect these internal routes
router.post("/verdict", internalRouteChecks, getJudgeVedict);
router.post("/status", internalRouteChecks, getStatus);

module.exports = { router: router };