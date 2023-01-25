import { randomUUID } from "crypto";
import express from "express";
import { resolve } from "path";
import {
  addNumber,
  addPlayer,
  createGame,
  kickPlayer,
  nextPlayer,
  shift,
  startGame,
} from "../../common/puzzle";
import { getGame, storeGame } from "./store";

const PORT = 8090;
const DIST_PATH = resolve(__dirname, "../../client/dist");

const app = express();

app.use(express.json());
app.use(express.static(DIST_PATH));

// Create game
// Expects { hostPlayerName: string, size: number }
app.post("/api/game", async (req, res, next) => {
  if (
    typeof req.body.hostPlayerName !== "string" &&
    req.body.hostPlayerName !== ""
    // TODO: check size number
  ) {
    next(new Error("Expected host player name"));
  } else {
    const id = randomUUID();
    let game = createGame(req.body.size);
    game = addPlayer(game, req.body.hostPlayerName);
    game = addNumber(game);
    storeGame(id, game);
    res.json({ id });
  }
});

// Get game
app.get("/api/game/:id", (req, res, next) => {
  res.json(getGame(req.params.id));
});

// Expects { state: 'STARTED' }
app.put("/api/game/:id", (req, res, next) => {
  if (req.body.state === "STARTED") {
    let game = getGame(req.params.id);
    game = startGame(game);
    storeGame(req.params.id, game);
    res.json(game);
  } else {
    next(new Error("Invalid request"));
  }
});

// Join game
app.post("/api/game/:id/player", async (req, res, next) => {
  let game = getGame(req.params.id);
  game = addPlayer(game, req.body.playerName);
  await storeGame(req.params.id, game);
  res.json({ ok: true });
});

// Kick player
app.delete("/api/game/:id/player/:name", async (req, res, next) => {
  let game = getGame(req.params.id);
  game = kickPlayer(game, req.params.name);
  await storeGame(req.params.id, game);
  res.status(204).json({ ok: true });
});

// Shift board
// Expects { direction: N/E/S/W }
app.post("/api/game/:id/move", async (req, res) => {
  let game = getGame(req.params.id);
  game = shift(game, req.body.direction);
  game = nextPlayer(game);
  game = addNumber(game);
  await storeGame(req.params.id, game);
  res.json({ ok: true });
});

// Any other route, return index.html (supporting history api)
app.get("*", (_, res, next) => {
  res.sendFile(resolve(DIST_PATH, "index.html"), next);
});

app.listen(PORT).on("listening", () => {
  console.log(`Listening on port http://127.0.0.1:${PORT}`);
});
