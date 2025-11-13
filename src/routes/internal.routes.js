// src/routes/internal.routes.js
console.log("--- INTERNAL.ROUTES.JS [v2] IS LOADING ---");
const express = require("express");
const { internalRouteChecks } = require("../middleware/internal.middleware.js");
const { getJudgeVedict, getStatus } = require("../controllers/worker.controller.js");

const router = express.Router();

// Use the middleware to protect these internal routes
router.post("/verdict", internalRouteChecks, getJudgeVedict);
router.post("/status", internalRouteChecks, getStatus);

module.exports = { router: router };