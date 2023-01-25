import { Game } from "../../common/types";
import { readFile, writeFile } from "fs/promises";

const games: Record<string, Game> = {};

async function readGameStore() {
  try {
    const json = await readFile("games.json", "utf8");
    Object.assign(games, JSON.parse(json));
  } catch {}
}

async function writeGameStore() {
  await writeFile("games.json", JSON.stringify(games, null, 2));
}

export function getGame(id: string): Game {
  const game = games[id];
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
}

export async function storeGame(id: string, game: Game): Promise<void> {
  games[id] = game;
  await writeGameStore();
}

readGameStore();
