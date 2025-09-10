const request = require("supertest");
const app = require("../../app"); // seu app principal

// Mock dos services
const curvasService = require("../../src/services/curvasService");
jest.mock("../../src/services/curvasService.js");

describe("Testes de integração - /curvas", () => {
  // Dados mock de sucesso
  const mockTodasLigas = {
    aba: "CURVAS",
    ligas: {
      "817128": { liga: "817128", media: 1200, curva: [{ tempo: 1, valor: 1000 }] },
      "817156": { liga: "817156", media: 1150, curva: [{ tempo: 1, valor: 1050 }] },
      "817176": { liga: "817176", media: 1170, curva: [{ tempo: 1, valor: 1020 }] }
    }
  };

  const mockLiga = {
    liga: "817176",
    media: 1170,
    curva: [{ tempo: 1, valor: 1020 }]
  };

  const mockComparacao = {
    liga1: mockTodasLigas.ligas["817176"],
    liga2: mockTodasLigas.ligas["817156"],
    diferencaMedia: 20
  };

  // Reset mocks antes de cada teste
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ========================
  // Cenários de sucesso
  // ========================

  it("GET /curvas deve retornar JSON com análise geral", async () => {
    curvasService.analisarCurvas.mockReturnValue(mockTodasLigas);

    const res = await request(app).get("/curvas");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTodasLigas);
    expect(curvasService.analisarCurvas).toHaveBeenCalledWith("./src/data/Curvas estudo.xlsx");
  });

  it("GET /curvas/:liga deve retornar dados da liga", async () => {
    curvasService.carregarCurvas.mockReturnValue([mockTodasLigas.ligas]);
    curvasService.analisarLiga.mockReturnValue(mockLiga);

    const res = await request(app).get("/curvas/817176");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockLiga);
    expect(curvasService.analisarLiga).toHaveBeenCalled();
  });

  it("GET /curvas/comparar deve retornar comparação de todas as ligas", async () => {
    curvasService.compararLigas.mockReturnValue(mockTodasLigas);

    const res = await request(app).get("/curvas/comparar");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTodasLigas);
    expect(curvasService.compararLigas).toHaveBeenCalledWith("./src/data/Curvas estudo.xlsx");
  });

  it("GET /curvas/comparar/:liga1/:liga2 deve retornar comparação entre duas ligas", async () => {
    curvasService.compararDuasLigas.mockReturnValue(mockComparacao);

    const res = await request(app).get("/curvas/comparar/817176/817156");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockComparacao);
    expect(curvasService.compararDuasLigas).toHaveBeenCalledWith("817176", "817156", "./src/data/Curvas estudo.xlsx");
  });

  // ========================
  // Cenários de erro
  // ========================

  it("GET /curvas retorna 500 se ocorrer erro no service", async () => {
    curvasService.analisarCurvas.mockImplementation(() => { throw new Error("Erro simulado"); });

    const res = await request(app).get("/curvas");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Erro simulado");
  });

  it("GET /curvas/:liga retorna 500 se analisarLiga falhar", async () => {
    curvasService.carregarCurvas.mockReturnValue([mockTodasLigas.ligas]);
    curvasService.analisarLiga.mockImplementation(() => { throw new Error("Erro de liga"); });

    const res = await request(app).get("/curvas/817176");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Erro de liga");
  });

  it("GET /curvas/comparar/:liga1/:liga2 retorna 404 se compararDuasLigas falhar", async () => {
    curvasService.compararDuasLigas.mockImplementation(() => { throw new Error("Liga não encontrada"); });

    const res = await request(app).get("/curvas/comparar/000/999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Liga não encontrada");
  });
});
