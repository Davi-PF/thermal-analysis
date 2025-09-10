const express = require("express");
const { getCurvas, getLiga, comparar, compararDuasLigas } = require("../controllers/curvasController");

const router = express.Router();

router.get("/", getCurvas);          // todas as ligas
router.get("/comparar", comparar);   // comparação
router.get("/:liga", getLiga);       // liga específica
router.get("/comparar/:liga1/:liga2", compararDuasLigas); // comparação entre duas ligas

module.exports = router;
