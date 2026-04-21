const express = require("express");
const router = express.Router();

const { completeKYC,getProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/kyc", authMiddleware, completeKYC);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;