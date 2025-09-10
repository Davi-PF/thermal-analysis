const { analisarArquivo } = require("../services/analysisService");
exports.getAnalise = (req, res) => {
  try {
    const resultado = analisarArquivo("data/Curvas estudo.xlsx");
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
