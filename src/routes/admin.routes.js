// src/routes/internal.routes.js
const express = require("express");
const { uploadMcq, uploadProblem, login, startOA, rejudge, logout, makeAdmin } = require("../controllers/admin.controller.js");
const { protectAdminRoute } = require("../middleware/admin.middleware.js");

const router = express.Router();

// Use the middleware to protect these internal routes
router.post("/uploadMcq", protectAdminRoute, uploadMcq);
router.post("/uploadProblem", protectAdminRoute, uploadProblem);
router.post("/startOA", protectAdminRoute, startOA);
router.post("/rejudge/:id", protectAdminRoute, rejudge);
router.post("/login", login);
router.post("/logout", logout);
router.post("/makeAdmin", protectAdminRoute, makeAdmin);

module.exports = { router: router };