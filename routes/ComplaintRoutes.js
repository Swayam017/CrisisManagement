const express = require("express");
const router = express.Router();

const { createComplaint } = require("../controllers/ComplaintController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createComplaint);

module.exports = router;