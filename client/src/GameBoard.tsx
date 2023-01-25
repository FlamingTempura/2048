import React, { Fragment, useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Direction, Game } from "../../common/types";
import { PlayerContext } from "./App";

export function GameBoard({
  game,
  gameQueryKey,
}: {
  game: Game;
  gameQueryKey: string[];
}) {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const moveMutation = useMutation<
    undefined,
    unknown,
    { direction: Direction }
  >({
    mutationKey: ["move"],
    mutationFn: async (data) => {
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
    onSuccess: () => queryClient.invalidateQueries(gameQueryKey),
  });

  const kickMutation = useMutation<undefined, unknown, void>({
    mutationKey: ["kick"],
    mutationFn: async (data) => {
      const res = await fetch(`/api/game/${id}/player/${activePlayer.name}`, {
        method: "DELETE",
        body: JSON.stringify(data),
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(gameQueryKey),
  });

  const handleShift = async (direction: Direction) => {
    await moveMutation.mutate({ direction });
  };

  const { playerName } = useContext(PlayerContext);

  const player = game.players.find((p) => p.name === playerName);
  const activePlayer = game.players[game.activePlayerIndex];

  const isActivePlayer = player?.name === activePlayer.name;

  return (
    <div>
      <h2>The game {id}</h2>

      {player ? <p>Your score: {player.score}</p> : <p>You are spectating</p>}

      {isActivePlayer ? (
        <p>Your turn</p>
      ) : (
        <p>
          {activePlayer.name}'s turn{" "}
          <button onClick={() => kickMutation.mutate()}>Kick</button>
        </p>
      )}

      <GameBoardGrid game={game} />
      {isActivePlayer && (
        <>
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
        </>
      )}

      <div>
        Scores:
        <ul>
          {game.players.map((player) => (
            <li key={player.name}>
              {player.name}: {player.score}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GameBoardGrid({ game }: { game: Game }) {
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
