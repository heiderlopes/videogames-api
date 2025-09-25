const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "../public/images")));

// 🗂️ "Banco de dados" em memória
let games = [];
let currentId = 1;

// ⚙️ Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Videogames API",
      version: "1.0.0",
      description: "API simples para cadastro de jogos de videogame",
    },
    servers: [
      {
        url: `https://videogames-api-bbf46be3e1a8.herokuapp.com`,
      },
    ],
  },
  apis: [__filename], // 👈 garante que vai ler as anotações deste arquivo
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - title
 *         - platform
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do jogo
 *         title:
 *           type: string
 *           description: Nome do jogo
 *         platform:
 *           type: string
 *           description: Plataforma do jogo
 *         releaseYear:
 *           type: integer
 *           description: Ano de lançamento
 *         imageUrl:
 *           type: string
 *           description: URL da imagem do jogo
 */

/**
 * @swagger
 * tags:
 *   - name: Games
 *     description: CRUD de jogos
 *   - name: Banners
 *     description: Lista de banners promocionais
 */

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Cadastra um novo jogo
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       201:
 *         description: Jogo criado
 */
app.post("/games", (req, res) => {
  const { title, platform, releaseYear, imageUrl } = req.body;
  if (!title || !platform) {
    return res
      .status(400)
      .json({ error: "Título e plataforma são obrigatórios" });
  }
  const newGame = {
    id: currentId++,
    title,
    platform,
    releaseYear: releaseYear || null,
    imageUrl: imageUrl || null,
  };
  games.push(newGame);
  res.status(201).json(newGame);
});

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Lista todos os jogos
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Lista de jogos
 */
app.get("/games", (req, res) => {
  res.json(games);
});

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Busca um jogo pelo ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo encontrado
 *       404:
 *         description: Não encontrado
 */
app.get("/games/:id", (req, res) => {
  const game = games.find((g) => g.id === parseInt(req.params.id));
  if (!game) return res.status(404).json({ error: "Jogo não encontrado" });
  res.json(game);
});

/**
 * @swagger
 * /games/{id}:
 *   put:
 *     summary: Atualiza um jogo
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       200:
 *         description: Jogo atualizado
 */
app.put("/games/:id", (req, res) => {
  const game = games.find((g) => g.id === parseInt(req.params.id));
  if (!game) return res.status(404).json({ error: "Jogo não encontrado" });

  const { title, platform, releaseYear, imageUrl } = req.body;
  if (title) game.title = title;
  if (platform) game.platform = platform;
  if (releaseYear) game.releaseYear = releaseYear;
  if (imageUrl) game.imageUrl = imageUrl;

  res.json(game);
});

/**
 * @swagger
 * /games/{id}:
 *   delete:
 *     summary: Remove um jogo
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo removido
 */
app.delete("/games/:id", (req, res) => {
  const index = games.findIndex((g) => g.id === parseInt(req.params.id));
  if (index === -1)
    return res.status(404).json({ error: "Jogo não encontrado" });

  const deletedGame = games.splice(index, 1);
  res.json(deletedGame[0]);
});

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: Retorna lista de URLs de banners
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Lista de banners
 */
app.get("/banners", (req, res) => {
  const banners = [
    "https://videogames-api-bbf46be3e1a8.herokuapp.com/images/banner1.png",
    "https://videogames-api-bbf46be3e1a8.herokuapp.com/images/banner2.png",
    "https://videogames-api-bbf46be3e1a8.herokuapp.com/images/banner3.png",
    "https://videogames-api-bbf46be3e1a8.herokuapp.com/images/banner4.png",
  ];
  res.json(banners);
});

// 🚀 Start server

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
});
