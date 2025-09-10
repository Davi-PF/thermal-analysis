const xlsx = require("xlsx");
function analisarArquivo(path) {
  const workbook = xlsx.readFile(path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  return {
    linhas: data.length,
    colunas: Object.keys(data[0]),
    exemplo: data.slice(0, 3),
  };
}
module.exports = { analisarArquivo };
