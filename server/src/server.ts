import { randomUUID } from "crypto";
import express from "express";
import { readdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { Game } from "../../common/types";

const PORT = 8090;
const DEFAULT_GRID_SIZE = 6;

const DIST_PATH = resolve(__dirname, "../../client/dist");

const app = express();

app.use(express.json());
app.use(express.static(DIST_PATH));

// Expects { players: number }
app.post("/api/game", async (req, res) => {
  console.log(req.body);
  if (typeof req.body.players !== "number") {
    throw new Error("Expected number for players");
  }
  res.json({ id: await startGame(req.body.players) });
});

app.get("/api/game/:id", (req, res) => {
  const game = games[req.params.id];
  if (!game) {
    throw new Error("Game not found");
  }
  res.json(game);
});

// Expects { direction: N/E/S/W }
app.post("/api/game/:id/move", (req, res) => {
  const game = games[req.params.id];
  if (!game) {
    throw new Error("Game not found");
  }
  game.moveHistory.push({ player: 1, direction: req.body.direction });
  res.json({ ok: true });
});

app.get("*", (_, res, next) => {
  res.sendFile(resolve(DIST_PATH, "index.html"), next);
});

app.listen(PORT).on("listening", () => {
  console.log(`Listening on port http://127.0.0.1:${PORT}`);
});

console.log(readdirSync("./client/dist"));

async function startGame(players: number): Promise<string> {
  const id = randomUUID();
  const size = DEFAULT_GRID_SIZE; // Could be customizable by user in future
  games[id] = {
    players,
    size,
    moveHistory: [],
    startCoordinate: [
      Math.floor(Math.random() * size),
      Math.floor(Math.random() * size),
    ],
  };
  await writeGames();
  return id;
}

const games: Record<string, Game> = {};

async function writeGames() {
  await writeFile("games.json", JSON.stringify(games, null, 2));
}

async function readGames() {
  try {
    const json = await readFile("games.json", "utf8");
    Object.assign(games, JSON.parse(json));
  } catch {}
}

readGames();
