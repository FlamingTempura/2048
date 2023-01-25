import React, { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Direction, Game } from "../../common/types";

export function GameScreen() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["game", id], [id]);

  const gameQuery = useQuery<undefined, unknown, Game>({
    queryKey,
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
    onSuccess: () => queryClient.invalidateQueries(queryKey),
  });

  const handleShift = async (direction: Direction) => {
    await moveMutation.mutate({ direction });
    console.log("invalidating");
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
      <button
        onClick={() => handleShift("N")}
        disabled={moveMutation.status === "loading"}
      >
        Up
      </button>
      <button
        onClick={() => handleShift("E")}
        disabled={moveMutation.status === "loading"}
      >
        Right
      </button>
      <button
        onClick={() => handleShift("S")}
        disabled={moveMutation.status === "loading"}
      >
        Down
      </button>
      <button
        onClick={() => handleShift("W")}
        disabled={moveMutation.status === "loading"}
      >
        Left
      </button>
    </div>
  );
}

function GameBoard({ game }: { game: Game }) {
  return (
    <Grid size={game.size}>
      {game.board.map((row, y) => (
        <Fragment key={y}>
          {row.map((cell, x) => (
            <Cell key={x}>{cell}</Cell>
          ))}
        </Fragment>
      ))}
    </Grid>
  );
}

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
