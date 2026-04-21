const express = require("express");
const router = express.Router();

const { getDistributors } = require("../controllers/distributorController");

router.get("/", getDistributors);

module.exports = router;