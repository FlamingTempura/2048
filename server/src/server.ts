import { randomUUID } from "crypto";
import fastify from "fastify";
import { resolve } from "path";
import {
  addNumber,
  addPlayer,
  createGame,
  kickPlayer,
  nextPlayer,
  shift,
  startGame,
} from "./puzzle";
import { Direction, Game } from "../../common/types";
import { getGame, storeGame } from "./store";
import fastifyStatic from "@fastify/static";
import websocket, { SocketStream } from "@fastify/websocket";

const PORT = 8090;
const DIST_PATH = resolve(__dirname, "../../client/dist");

const app = fastify();

app.register(fastifyStatic, { root: DIST_PATH });
app.register(websocket);

// Websocket to subscribe to game event changes
//
// On a change to the game (see updateGameSubscribers), the entire game object
// is sent to all subscribers. I suppose we could just send a change description
// to keep frames smaller (e.g. "moved left"), but sending the entire game
// object keeps things simple. And the game object is never going to be huge.
app.register(async (fastify) => {
  fastify.get<{ Params: { id: string } }>(
    "/api/game/:id/subscribe",
    { websocket: true },
    (connection, req) => {
      const gameId = req.params.id;
      const subs = gameSubscribers.get(gameId) ?? new Set();
      subs.add(connection);
      gameSubscribers.set(gameId, subs);
      connection.socket.on("close", () => subs.delete(connection));
    }
  );
});

const gameSubscribers = new Map<string, Set<SocketStream>>();

function updateGameSubscribers(id: string, game: Game): void {
  const subscribers = gameSubscribers.get(id) ?? new Set();
  for (const sub of subscribers) {
    sub.socket.send(JSON.stringify(game));
  }
}

// Create game
export type CreateGameBody = { hostPlayerName: string; size: number };
app.post<{ Body: CreateGameBody }>(
  "/api/game",
  {
    schema: {
      body: {
        type: "object",
        required: ["hostPlayerName", "size"],
        properties: {
          hostPlayerName: { type: "string" },
          size: { type: "number" },
        },
      },
    },
  },
  async (req) => {
    const id = randomUUID();
    let game = createGame(req.body.size);
    game = addPlayer(game, req.body.hostPlayerName);
    game = addNumber(game, 2);
    await storeGame(id, game);
    return { id };
  }
);

// Get game
app.get<{ Params: { id: string } }>("/api/game/:id", (req) => {
  return getGame(req.params.id);
});

// Start game
// Expects { state: 'STARTED' }
app.put<{ Params: { id: string } }>(
  "/api/game/:id",
  {
    schema: {
      body: {
        type: "object",
        required: ["state"],
        properties: { state: { const: "STARTED" } },
      },
    },
  },
  async (req) => {
    let game = getGame(req.params.id);
    game = startGame(game);
    await storeGame(req.params.id, game);
    updateGameSubscribers(req.params.id, game);
    return { ok: true };
  }
);

// Join game
export type JoinGameBody = { playerName: string };
app.post<{ Params: { id: string }; Body: JoinGameBody }>(
  "/api/game/:id/player",
  {
    schema: {
      body: {
        type: "object",
        required: ["playerName"],
        properties: { playerName: { type: "string" } },
      },
    },
  },
  async (req) => {
    let game = getGame(req.params.id);
    game = addPlayer(game, req.body.playerName);
    await storeGame(req.params.id, game);
    updateGameSubscribers(req.params.id, game);
    return { ok: true };
  }
);

// Kick player
app.delete<{ Params: { id: string; name: string } }>(
  "/api/game/:id/player/:name",
  async (req) => {
    let game = getGame(req.params.id);
    game = kickPlayer(game, req.params.name);
    await storeGame(req.params.id, game);
    updateGameSubscribers(req.params.id, game);
    return { ok: true };
  }
);

// Shift board
// Expects { direction: N/E/S/W, playerName: string } - we check that it's playerName's turn
export type ShiftBoardBody = { direction: Direction; playerName: string };
app.post<{ Params: { id: string }; Body: ShiftBoardBody }>(
  "/api/game/:id/move",
  {
    schema: {
      body: {
        type: "object",
        required: ["direction", "playerName"],
        properties: {
          direction: { type: "string" },
          playerName: { type: "string" },
        },
      },
    },
  },
  async (req) => {
    let game = getGame(req.params.id);
    game = shift(game, req.body.direction, req.body.playerName);
    game = nextPlayer(game);
    game = addNumber(game, 1);
    await storeGame(req.params.id, game);
    updateGameSubscribers(req.params.id, game);
    return { ok: true };
  }
);

// Any other route, return index.html (supporting history api)
app.setNotFoundHandler((_, res) => {
  res.sendFile("index.html");
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    throw err;
  } else {
    console.log(`Listening on port ${address}`);
  }
});
