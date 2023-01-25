import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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
      {createGameMutation.status === "loading" ? (
        <>Loading...</>
      ) : (
        <>
          <h2>Create game</h2>
          <Inputs>
            <label>Your name:</label>
            <input
              type="string"
              value={playerName}
              onChange={(e) => setPlayerName(e.currentTarget.value)}
            />
            <label>Size</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.currentTarget.valueAsNumber)}
            />
          </Inputs>
          <StartButton onClick={handleStart}>Start</StartButton>
          {createGameMutation.status === "error" ? (
            <p>{String(createGameMutation.error)}</p>
          ) : null}
        </>
      )}
    </div>
  );
}

const Inputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: center;
`;

const StartButton = styled.button`
  margin-top: 30px;
  padding: 12px;
  width: 100px;
`;
