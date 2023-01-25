export type Game = {
  size: number;
  players: number;
  moveHistory: Move[];
  /**
   * Defines the initial grid as a location of the number 2 within the grid.
   */
  startCoordinate: [number, number];
};

type Move = {
  player: number;
  direction: Direction;
  addedNumber: [number, number];
};

export type Direction = "N" | "E" | "S" | "W";
