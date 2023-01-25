import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateGameMutation } from "./api";
import { PlayerContext } from "./PlayerContext";

export function StartScreen() {
  const nav = useNavigate();
  const { playerName, setPlayerName } = useContext(PlayerContext);
  const [size, setSize] = useState(6);

  const createGameMutation = useCreateGameMutation();

  async function handleStart() {
    const res = await createGameMutation.mutateAsync({
      hostPlayerName: playerName,
      size,
    });
    nav(`/game/${res.id}`);
  }

  return (
    <div>
      <label>
        Your name:{" "}
        <input
          type="string"
          value={playerName}
          onChange={(e) => setPlayerName(e.currentTarget.value)}
        />
      </label>

      {createGameMutation.status === "loading" ? (
        <>Loading...</>
      ) : (
        <>
          <h2>Create game</h2>
          <label>
            Size{" "}
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.currentTarget.valueAsNumber)}
            />
          </label>
          <button onClick={handleStart}>Start</button>
          {createGameMutation.status === "error" ? (
            <p>{String(createGameMutation.error)}</p>
          ) : null}
        </>
      )}
    </div>
  );
}
