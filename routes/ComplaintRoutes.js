const express = require("express");
const router = express.Router();

const { createComplaint,getMyComplaints } = require("../controllers/ComplaintController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createComplaint);
router.get("/my", authMiddleware, getMyComplaints);

module.exports = router;