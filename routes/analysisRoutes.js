const express = require("express");
const { getAnalise } = require("../controllers/analysisController");
const router = express.Router();
router.get("/", getAnalise);
module.exports = router;
