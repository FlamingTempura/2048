import { Direction, Game, ShiftResult } from "./types";
import sample from "lodash/sample";
import { cloneDeep } from "lodash";

export function shift(game: Game, direction: Direction): Game {
  const newGame = cloneDeep(game);
  let shiftResult: ShiftResult;
  switch (direction) {
    case "N":
      shiftResult = shiftNorth(newGame.board, newGame.size);
      break;
    case "E":
      shiftResult = shiftEast(newGame.board, newGame.size);
      break;
    case "S":
      shiftResult = shiftSouth(newGame.board, newGame.size);
      break;
    case "W":
      shiftResult = shiftWest(newGame.board, newGame.size);
      break;
    default:
      throw new Error("Invalid direction");
  }
  newGame.board = shiftResult.board;
  newGame.players[game.activePlayerIndex].score += shiftResult.score;
  return newGame;
}

function shiftNorth(board: number[][], size: number): ShiftResult {
  const newBoard = transpose(board);
  const res = shiftWest(newBoard, size);
  return { ...res, board: transpose(res.board) };
}

function shiftEast(board: number[][], size: number): ShiftResult {
  const newBoard = flipH(board);
  const res = shiftWest(newBoard, size);
  return { ...res, board: flipH(res.board) };
}

function shiftSouth(board: number[][], size: number): ShiftResult {
  const newBoard = flipH(transpose(board));
  const res = shiftWest(newBoard, size);
  return { ...res, board: transpose(flipH(res.board)) };
}

function shiftWest(board: number[][], size: number): ShiftResult {
  let score = 0;
  for (let y = 0; y < size; y++) {
    const row = board[y].filter((cell) => cell !== 0);

    for (let x = 0; x < row.length - 1; x++) {
      if (row[x] === -1) continue;
      // check if next is equal
      if (row[x] === row[x + 1]) {
        score = row[x] * 2;
        row[x] = row[x] * 2;
        // TODO: if 2048, game is won
        row[x + 1] = -1; // ignore the next cell
      }
    }
    board[y] = zeroFill(
      row.filter((cell) => cell !== -1),
      size
    );
  }
  return { board, score };
}

function transpose(array: number[][]): number[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

function flipH(array: number[][]): number[][] {
  return array.map((row) => [...row].reverse());
}

function zeroFill(arr: number[], length: number): number[] {
  return [...arr, ...Array(length).fill(0)].slice(0, length);
}

/**
 * Adds a 2 to a random empty cell
 */
export function addNumber(game: Game): Game {
  const emptyCoords: [number, number][] = [];
  for (let x = 0; x < game.size; x++) {
    for (let y = 0; y < game.size; y++) {
      if (game.board[y][x] === 0) {
        emptyCoords.push([x, y]);
      }
    }
  }

  const board = cloneDeep(game.board);

  if (emptyCoords.length === 0) {
    throw "TODO: handle end game";
  } else {
    const [x, y] = sample(emptyCoords);
    board[y][x] = 2;
  }

  return { ...game, board };
}

function emptyBoard(size: number): number[][] {
  const grid: number[][] = [];

  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = 0;
    }
  }
  return grid;
}

export function createGame(size: number): Game {
  return {
    players: [],
    activePlayerIndex: 0,
    size,
    board: emptyBoard(size),
    state: "LOBBY",
  };
}

export function addPlayer(game: Game, name: string): Game {
  if (game.players.some((p) => p.name === name)) {
    throw new Error("Player with that name already in the game");
  }
  return {
    ...game,
    players: [...game.players, { name, score: 0 }],
  };
}

export function startGame(game: Game): Game {
  if (game.state === "ENDED") {
    throw new Error("Game has ended");
  }
  return { ...game, state: "STARTED" };
}

export function kickPlayer(game: Game, playerName: string): Game {
  const index = game.players.findIndex((p) => p.name === playerName);

  if (index === -1) {
    // Already deleted, no need to throw error in this case
    return game;
  } else {
    return {
      ...game,
      players: [
        ...game.players.slice(0, index),
        ...game.players.slice(index + 1),
      ],
      activePlayerIndex:
        game.activePlayerIndex > index
          ? game.activePlayerIndex - 1
          : game.activePlayerIndex,
    };
  }
}

export function nextPlayer(game: Game): Game {
  let next = game.activePlayerIndex + 1;
  if (next >= game.players.length) {
    next = 0;
  }
  return { ...game, activePlayerIndex: next };
}
