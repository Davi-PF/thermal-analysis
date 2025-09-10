const request = require("supertest");
const express = require("express");
const router = require("../../src/routes/analysisRoutes");

// Mock do service
jest.mock("../../src/services/analysisService", () => ({
  analisarArquivo: jest.fn()
}));

const { analisarArquivo } = require("../../src/services/analysisService");

describe("Rota /analise", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use("/", router);
  });

  it("deve retornar análise com sucesso", async () => {
    // Dados fictícios para o mock
    const mockResultado = {
      linhas: 10,
      colunas: ["Nome", "Idade", "Cidade"],
      exemplo: [
        { Nome: "Alice", Idade: 25, Cidade: "SP" },
        { Nome: "Bob", Idade: 30, Cidade: "RJ" }
      ]
    };

    analisarArquivo.mockReturnValue(mockResultado);

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResultado);
    expect(analisarArquivo).toHaveBeenCalledWith("./src/data/Curvas estudo.xlsx");
  });

  it("deve retornar 500 em caso de erro", async () => {
    analisarArquivo.mockImplementation(() => {
      throw new Error("Arquivo não encontrado");
    });

    const res = await request(app).get("/");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Arquivo não encontrado");
  });
});
