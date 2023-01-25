export type Game = {
  size: number;
  players: number;
  board: number[][];
};

type Move = {
  player: number;
  direction: Direction;
  addedNumber: [number, number];
};

export type Direction = "N" | "E" | "S" | "W";

export type ShiftResult = {
  board: number[][];
  //transitions: { from: [number, number], to: [number, number], score: number }
};
