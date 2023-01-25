import React, { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Direction, Game } from "../../common/types";

export function GameScreen() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const gameQuery = useQuery<undefined, unknown, Game>({
    queryKey: ["game", id],
    queryFn: async () => {
      const res = await fetch(`/api/game/${id}`);
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    cacheTime: 0,
  });

  const moveMutation = useMutation<
    undefined,
    unknown,
    { direction: Direction }
  >({
    mutationKey: ["move"],
    mutationFn: async (data) => {
      console.log("mutating");
      const res = await fetch(`/api/game/${id}/move`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
  });

  const handleDown = async () => {
    await moveMutation.mutate({ direction: "S" });
    queryClient.invalidateQueries(["game", id]);
  };

  if (gameQuery.status === "loading") {
    return <p>Loading...</p>;
  }
  if (gameQuery.status === "error") {
    return <p>Error! {String(gameQuery.error)}</p>;
  }

  if (gameQuery.status === "idle") {
    return <>Idle</>; // FIXME
  }

  return (
    <div>
      <h2>The game {id}</h2>
      <GameBoard game={gameQuery.data} />
      <button onClick={handleDown} disabled={moveMutation.status === "loading"}>
        Down
      </button>
    </div>
  );
}

function GameBoard({ game }: { game: Game }) {
  const board = useMemo(() => getBoardState(game), [game]);
  return (
    <Grid size={game.size}>
      {board.map((row, y) => (
        <Fragment key={y}>
          {row.map((cell, x) => (
            <Cell key={x}>{cell}</Cell>
          ))}
        </Fragment>
      ))}
    </Grid>
  );
}

function getBoardState(game: Game): GameGrid {
  const grid = emptyGrid(game.size);
  grid[game.startCoordinate[1]][game.startCoordinate[0]] = 2;

  for (const move of game.moveHistory) {
    switch (move.direction) {
      case "S":
        for (let x = 0; x < game.size; x++) {
          let newCol = grid.map((row) => row[x]).filter((cell) => cell !== 0);
          let skipNext = false;

          for (let i = 1; i < newCol.length; i++) {
            if (newCol[i] === newCol[i - 1]) {
              newCol[i - 1] = 0;
              newCol[i] *= 2;
              skipNext = true;
            } else {
              skipNext = false;
            }
          }

          for (let y = 0; y < game.size; y++) {
            grid[y][x] = newCol[y - newCol.length] ?? 0;
          }
        }
      default:
      // TODO
    }
  }

  return grid;
}

function emptyGrid(size: number): GameGrid {
  const grid: number[][] = [];

  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = 0;
    }
  }
  return grid;
}

type GameGrid = number[][];

const Grid = styled.div<{ size: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.size}, 60px);
  grid-template-rows: repeat(${(props) => props.size}, 60px);
`;

const Cell = styled.div`
  border: 1px solid #ccc;
  font-size: 40px;
  text-align: center;
  line-height: 60px;
`;
