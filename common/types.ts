export type Game = {
  size: number;
  players: Player[];
  activePlayerIndex: number;
  /** 0 represents an empty cell */
  board: number[][];
  state: "LOBBY" | "STARTED" | "ENDED";
};

export type GameWithId = Game & { id: string };

export type Direction = "N" | "E" | "S" | "W";

export type Player = {
  name: string;
  score: number;
};
