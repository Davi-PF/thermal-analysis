// app.js
const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // caso você queira receber JSON

// Rotas centralizadas
const routes = [
  { path: "/analise", handler: require("./src/routes/analysisRoutes") },
  { path: "/curvas", handler: require("./src/routes/curvasRoutes") },
  // Adicione novas rotas aqui conforme necessário
];

// Registrar todas as rotas
routes.forEach(route => {
  app.use(route.path, route.handler);
});

module.exports = app;
