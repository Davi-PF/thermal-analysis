const xlsx = require("xlsx");

/** =======================
 * Funções auxiliares
 * =======================
 */

// Primeira derivada (taxa de resfriamento)
function primeiraDerivada(curva) {
  return curva.map((p, i, arr) => {
    if (i === 0) return 0;
    return (p.valor - arr[i - 1].valor) / (p.tempo - arr[i - 1].tempo);
  });
}

// Segunda derivada (variação da taxa de resfriamento)
function segundaDerivada(curva) {
  const deriv1 = primeiraDerivada(curva);
  return deriv1.map((v, i, arr) => {
    if (i === 0) return 0;
    return (v - arr[i - 1]) / (curva[i].tempo - curva[i - 1].tempo);
  });
}

// Função para encontrar máximo/mínimo e índice correspondente
function maxMin(arr) {
  let max = -Infinity, min = Infinity, idxMax = 0, idxMin = 0;
  arr.forEach((v, i) => {
    if (v > max) { max = v; idxMax = i; }
    if (v < min) { min = v; idxMin = i; }
  });
  return { max, min, idxMax, idxMin };
}

/** =======================
 * Carregar curvas do XLSX
 * =======================
 */
function carregarCurvas(path) {
  const workbook = xlsx.readFile(path);
  if (!workbook || !workbook.Sheets) {
    throw new Error("A aba 'CURVAS' não foi encontrada.");
  }
  const sheet = workbook.Sheets["CURVAS"];
  if (!sheet) throw new TypeError("Cannot read properties of undefined (reading 'CURVAS')");
  const data = xlsx.utils.sheet_to_json(sheet);
  return data.filter(row => row["Código"] !== "Seq Curva");
}

/** =======================
 * Analisar uma liga
 * =======================
 */
function analisarLiga(linhas, liga) {
  const valores = linhas.map(r => Number(r[liga]));
  const tempo = linhas.map(r => Number(r["Código"]));

  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const soma = valores.reduce((a, b) => a + b, 0);
  const media = soma / valores.length;

  const inicial = valores[0];
  const final = valores[valores.length - 1];
  const tempoTotal = tempo[tempo.length - 1] - tempo[0];
  const taxaResfriamento = (final - inicial) / tempoTotal;

  // Curva completa
  const curva = tempo.map((t, i) => ({ tempo: t, valor: valores[i] }));

  // Análise avançada
  const deriv1 = primeiraDerivada(curva);
  const deriv2 = segundaDerivada(curva);

  const { idxMax: idxMaxResf, idxMin: idxMinResf } = maxMin(deriv1);
  const { idxMax: idxMax2, idxMin: idxMin2 } = maxMin(deriv2);

  const tempLiquidus = curva[0].valor;
  const tempFinal = curva[curva.length - 1].valor;
  const tempMaxResfriamento = curva[idxMinResf].valor;
  const tempMinResfriamento = curva[idxMaxResf].valor;

  // Exemplo de pontos interpretativos
  const deltaT = tempLiquidus - tempMaxResfriamento;
  const contraçãoPrimaria = deriv2[idxMin2];
  const contraçãoSecundaria = deriv2[idxMax2];
  const expansaoEutética = deriv2[idxMax2]; // mesma lógica, pode ajustar

  return {
    liga,
    pontos: linhas.length,
    max,
    min,
    media,
    inicial,
    final,
    tempoTotal,
    taxaResfriamento,
    curva,
    derivadas: { primeira: deriv1, segunda: deriv2 },
    tempLiquidus,
    tempFinal,
    tempMaxResfriamento,
    tempMinResfriamento,
    deltaT,
    contraçãoPrimaria,
    contraçãoSecundaria,
    expansaoEutética
  };
}

/** =======================
 * Análise consolidada
 * =======================
 */
function analisarCurvas(path) {
  const linhas = carregarCurvas(path);
  const ligas = Object.keys(linhas[0]).filter(c => c !== "Código");
  const resultados = {};

  ligas.forEach(liga => {
    resultados[liga] = analisarLiga(linhas, liga);
  });

  return { aba: "CURVAS", ligas: resultados };
}

/** =======================
 * Comparação entre ligas
 * =======================
 */
function compararLigas(linhasOuPath) {
  const linhas = Array.isArray(linhasOuPath) ? linhasOuPath : carregarCurvas(linhasOuPath);
  const ligas = Object.keys(linhas[0]).filter(c => c !== "Código");

  const analises = ligas.map(liga => analisarLiga(linhas, liga));
  const { max: maxPico, idxMax: idxMaxPico } = maxMin(analises.map(a => a.max));
  const { min: minFinal } = maxMin(analises.map(a => a.final));
  const maiorResfriamento = analises.reduce((a, b) => Math.abs(a.taxaResfriamento) > Math.abs(b.taxaResfriamento) ? a : b);

  return {
    aba: "CURVAS",
    resumo: {
      maiorPico: { liga: analises[idxMaxPico].liga, valor: maxPico },
      menorFinal: { liga: analises.find(a => a.final === minFinal).liga, valor: minFinal },
      maiorResfriamento: {
        liga: maiorResfriamento.liga,
        taxa: maiorResfriamento.taxaResfriamento
      }
    },
    detalhes: analises.map(a => ({
      liga: a.liga,
      max: a.max,
      min: a.min,
      media: a.media,
      taxaResfriamento: a.taxaResfriamento
    }))
  };
}

/** =======================
 * Comparação detalhada de duas ligas
 * =======================
 */
function compararDuasLigas(liga1, liga2, filePath) {
  const todasLigas = compararLigas(filePath);
  const detalheLiga1 = todasLigas.detalhes.find(d => d.liga === liga1);
  const detalheLiga2 = todasLigas.detalhes.find(d => d.liga === liga2);

  if (!detalheLiga1 || !detalheLiga2) {
    throw new Error("Uma ou ambas as ligas não foram encontradas");
  }

  const dadosCompletos = carregarCurvas(filePath);
  const analise1 = analisarLiga(dadosCompletos, liga1);
  const analise2 = analisarLiga(dadosCompletos, liga2);

  const diferencaMedia = analise1.media - analise2.media;

  return {
    liga1: analise1,
    liga2: analise2,
    diferencaMedia,
    comparacao: {
      melhorMedia: analise1.media > analise2.media ? liga1 : liga2,
      maiorPico: analise1.max > analise2.max ? liga1 : liga2,
      menorFinal: analise1.min < analise2.min ? liga1 : liga2,
      maiorResfriamento: Math.abs(analise1.taxaResfriamento) > Math.abs(analise2.taxaResfriamento) ? liga1 : liga2
    }
  };
}

module.exports = {
  carregarCurvas,
  analisarLiga,
  analisarCurvas,
  compararLigas,
  compararDuasLigas
};
