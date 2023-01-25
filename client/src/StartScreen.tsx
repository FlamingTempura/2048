import React, { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

export function StartScreen() {
  const nav = useNavigate();

  const createGameMutation = useMutation<
    { id: string },
    unknown,
    { players: number }
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

  const [players, setPlayers] = useState<number>(2);
  const [id, setId] = useState<string>("");

  async function handleStart() {
    const res = await createGameMutation.mutateAsync({ players });
    console.log(res);
    nav(`/game/${res.id}`);
  }

  return (
    <div>
      <h2>Join game</h2>
      <label>
        Game ID:{" "}
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
        />
      </label>
      <button>Join</button>

      {createGameMutation.status === "loading" ? (
        <>Loading...</>
      ) : (
        <>
          <h2>Create game</h2>
          <label>
            Players:{" "}
            <input
              type="number"
              value={players}
              onChange={(e) => setPlayers(e.currentTarget.valueAsNumber)}
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
