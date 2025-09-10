const {
  analisarCurvas,
  analisarLiga,
  compararLigas,
  compararDuasLigas,
} = require("../services/curvasService");

const filePath = "./src/data/Curvas estudo.xlsx";

// GET /curvas → todas as ligas
exports.getCurvas = (req, res) => {
  try {
    const resultado = analisarCurvas(filePath);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /curvas/:liga → detalhes de uma liga específica
exports.getLiga = (req, res) => {
  try {
    const liga = req.params.liga;
    const resultado = analisarLiga(
      require("../services/curvasService").carregarCurvas(filePath),
      liga
    );
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /curvas/comparar → comparação entre ligas
exports.comparar = (req, res) => {
  try {
    const resultado = compararLigas(filePath);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.compararDuasLigas = (req, res) => {
  const { liga1, liga2 } = req.params;

  try {
    const resultado = compararDuasLigas(liga1, liga2, filePath);
    res.json(resultado);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
