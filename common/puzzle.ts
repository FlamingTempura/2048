import { Direction, Game } from "./types";
import sample from "lodash/sample";

export function shift(game: Game, direction: Direction): void {
  switch (direction) {
    case "N":
      game.board = shiftNorth(game.board, game.size);
      break;
    case "E":
      game.board = shiftEast(game.board, game.size);
      break;
    case "S":
      game.board = shiftSouth(game.board, game.size);
      break;
    case "W":
      game.board = shiftWest(game.board, game.size);
      break;
    default:
      throw new Error("Invalid direction");
  }
}

function shiftNorth(board: number[][], size: number): number[][] {
  const newBoard = transpose(board);
  shiftWest(newBoard, size);
  return transpose(newBoard);
}

function shiftEast(board: number[][], size: number): number[][] {
  const newBoard = flipH(board);
  shiftWest(newBoard, size);
  return flipH(newBoard);
}

function shiftSouth(board: number[][], size: number): number[][] {
  const newBoard = flipH(transpose(board));
  shiftWest(newBoard, size);
  return transpose(flipH(newBoard));
}

function shiftWest(board: number[][], size: number): number[][] {
  for (let y = 0; y < size; y++) {
    const row = board[y].filter((cell) => cell !== 0);

    for (let x = 0; x < row.length - 1; x++) {
      if (row[x] === -1) continue;
      // check if next is equal
      if (row[x] === row[x + 1]) {
        row[x] = row[x] * 2;
        row[x + 1] = -1; // ignore the next cell
      }
    }
    board[y] = zeroFill(
      row.filter((cell) => cell !== -1),
      size
    );
  }
  return board;
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

export function addNumber(game: Game): void {
  const emptyCoords: [number, number][] = [];
  for (let x = 0; x < game.size; x++) {
    for (let y = 0; y < game.size; y++) {
      if (game.board[y][x] === 0) {
        emptyCoords.push([x, y]);
      }
    }
  }

  if (emptyCoords.length === 0) {
    throw "TODO: handle end game";
  } else {
    const [x, y] = sample(emptyCoords);
    game.board[y][x] = 2;
  }
}

export function emptyBoard(size: number): number[][] {
  const grid: number[][] = [];

  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = 0;
    }
  }
  return grid;
}
