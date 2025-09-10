const { analisarArquivo } = require("../../src/services/analysisService");
const xlsx = require("xlsx");

jest.mock("xlsx");

describe("Função analisarArquivo - mock do xlsx", () => {
  it("deve retornar dados corretamente com mock", () => {
    // Mock do workbook
    const mockData = [
      { Nome: "Alice", Idade: 25, Cidade: "São Paulo" },
      { Nome: "Bob", Idade: 30, Cidade: "Rio de Janeiro" },
      { Nome: "Carol", Idade: 22, Cidade: "Belo Horizonte" },
      { Nome: "Dan", Idade: 28, Cidade: "Curitiba" }
    ];

    xlsx.readFile.mockReturnValue({
      SheetNames: ["Plan1", "Plan2", "Plan3"],
      Sheets: {
        Plan1: {}, // conteúdo real não é necessário para sheet_to_json
        Plan2: {},
        Plan3: {}
      }
    });

    // Mock do sheet_to_json
    xlsx.utils.sheet_to_json = jest.fn().mockReturnValue(mockData);

    const resultado = analisarArquivo("arquivo-falso.xlsx");

    expect(resultado).toHaveProperty("linhas", 4);
    expect(resultado).toHaveProperty("colunas", ["Nome", "Idade", "Cidade"]);
    expect(resultado.exemplo).toEqual(mockData.slice(0, 3));
  });
});
