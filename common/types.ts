export type Game = {
  size: number;
  players: {
    name: string;
    score: number;
  }[];
  activePlayerIndex: number;
  board: number[][];
  state: "LOBBY" | "STARTED" | "ENDED";
};

type Move = {
  player: number;
  direction: Direction;
  addedNumber: [number, number];
};

export type Direction = "N" | "E" | "S" | "W";

export type ShiftResult = {
  board: number[][];
  score: number;
  //transitions: { from: [number, number], to: [number, number], score: number }
};
