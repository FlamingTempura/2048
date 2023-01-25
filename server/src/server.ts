import { randomUUID } from "crypto";
import express from "express";
import { readdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { addNumber, emptyBoard, shift } from "../../common/puzzle";
import { Game } from "../../common/types";

const PORT = 8090;

const DIST_PATH = resolve(__dirname, "../../client/dist");

const app = express();

app.use(express.json());
app.use(express.static(DIST_PATH));

// Expects { hostPlayerName: string, size: number }
app.post("/api/game", async (req, res, next) => {
  if (
    typeof req.body.hostPlayerName !== "string" &&
    req.body.hostPlayerName !== ""
    // TODO: check size number
  ) {
    next(new Error("Expected host player name"));
  } else {
    res.json({ id: await startGame(req.body.hostPlayerName, req.body.size) });
  }
});

app.get("/api/game/:id", (req, res, next) => {
  const game = games[req.params.id];
  if (!game) {
    next(new Error("Game not found"));
  } else {
    res.json(game);
  }
});

// Expects { state: 'STARTED' }
app.put("/api/game/:id", (req, res, next) => {
  const game = games[req.params.id];
  if (!game) {
    next(new Error("Game not found"));
  }
  if (req.body.state === "STARTED") {
    game.state = "STARTED";
    writeGames();
    res.json(game);
  } else {
    next(new Error("Invalid request"));
  }
});

app.post("/api/game/:id/player", async (req, res, next) => {
  const game = games[req.params.id];
  if (!game) {
    next(new Error("Game not found"));
  }
  game.players.push({ name: req.body.playerName, score: 0 });
  await writeGames();
  res.json({ ok: true });
});

// Kick
app.delete("/api/game/:id/player/:name", async (req, res, next) => {
  const game = games[req.params.id];
  if (!game) {
    next(new Error("Game not found"));
  }

  const index = game.players.findIndex((p) => p.name === req.params.name);

  if (index === -1) {
    res.json({});
  } else {
    if (game.activePlayerIndex > index) {
      game.activePlayerIndex--;
    }
    game.players.splice(index, 1);
  }
  await writeGames();
  res.json({ ok: true });
});

// Expects { direction: N/E/S/W }
app.post("/api/game/:id/move", async (req, res) => {
  const game = games[req.params.id];
  if (!game) {
    throw new Error("Game not found");
  }
  shift(game, req.body.direction);
  game.activePlayerIndex += 1;
  if (game.activePlayerIndex >= game.players.length) {
    game.activePlayerIndex = 0;
  }
  addNumber(game);
  await writeGames();
  res.json({ ok: true });
});

app.get("*", (_, res, next) => {
  res.sendFile(resolve(DIST_PATH, "index.html"), next);
});

app.listen(PORT).on("listening", () => {
  console.log(`Listening on port http://127.0.0.1:${PORT}`);
});

console.log(readdirSync("./client/dist"));

async function startGame(
  hostPlayerName: string,
  size: number
): Promise<string> {
  const id = randomUUID();
  games[id] = {
    players: [{ name: hostPlayerName, score: 0 }],
    activePlayerIndex: 0,
    size,
    board: emptyBoard(size),
    state: "LOBBY",
  };
  addNumber(games[id]);

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
