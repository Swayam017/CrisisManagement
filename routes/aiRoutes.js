const express = require("express");
const router = express.Router();

const { checkFraud } = require("../controllers/aiController");

router.post("/fraud-check", checkFraud);

module.exports = router;