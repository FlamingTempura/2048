import React, { useContext } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { Game } from "../../common/types";
import { PlayerContext } from "./App";

export function LobbyScreen({
  game,
  gameQueryKey,
}: {
  game: Game;
  gameQueryKey: string[];
}) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { playerName, setPlayerName } = useContext(PlayerContext);

  const startMutation = useMutation<undefined, unknown, void>({
    mutationKey: ["start"],
    mutationFn: async (data) => {
      const res = await fetch(`/api/game/${id}`, {
        method: "PUT",
        body: JSON.stringify({ state: "STARTED" }),
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(gameQueryKey),
  });

  const joinMutation = useMutation<undefined, unknown, void>({
    mutationKey: ["join"], // FIXME
    mutationFn: async () => {
      const res = await fetch(`/api/game/${id}/player`, {
        method: "POST",
        body: JSON.stringify({ playerName }),
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(gameQueryKey),
  });

  const joined = playerName && game.players.find((p) => p.name === playerName);

  return (
    <div>
      <h2>Lobby</h2>
      <p>Game ID: {id}</p>
      <p>Players:</p>
      <ul>
        {game.players.map((player) => (
          <li key={player.name}>
            {player.name} {player.name === playerName ? "(You)" : null}
          </li>
        ))}
      </ul>
      {!joined ? (
        <>
          <label>
            Your name:{" "}
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.currentTarget.value)}
            />
          </label>
          <button
            onClick={() => joinMutation.mutate()}
            disabled={playerName === ""}
          >
            Join game
          </button>
        </>
      ) : (
        <button onClick={() => startMutation.mutate()}>Start</button>
      )}
    </div>
  );
}
