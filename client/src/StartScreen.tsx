import React, { useContext, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "./App";

export function StartScreen() {
  const nav = useNavigate();
  const playerCtx = useContext(PlayerContext);

  const createGameMutation = useMutation<
    { id: string },
    unknown,
    { hostPlayerName: string }
  >({
    mutationKey: ["create-game"],
    mutationFn: async (data) => {
      const res = await fetch("/api/game", {
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

  async function handleStart() {
    const res = await createGameMutation.mutateAsync({
      hostPlayerName: playerCtx.playerName,
    });
    nav(`/game/${res.id}`);
  }

  return (
    <div>
      <label>
        Your name:{" "}
        <input
          type="string"
          value={playerCtx.playerName}
          onChange={(e) => playerCtx.setPlayerName(e.currentTarget.value)}
        />
      </label>

      {createGameMutation.status === "loading" ? (
        <>Loading...</>
      ) : (
        <>
          <h2>Create game</h2>
          <button onClick={handleStart}>Start</button>
          {createGameMutation.status === "error" ? (
            <p>{String(createGameMutation.error)}</p>
          ) : null}
        </>
      )}
    </div>
  );
}
