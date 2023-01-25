import React, { useContext } from "react";
import { GameWithId } from "../../common/types";
import { useJoinGameMutation, useStartGameMutation } from "./api";
import { PlayerContext } from "./App";

export function LobbyScreen({ game }: { game: GameWithId }) {
  const { playerName, setPlayerName } = useContext(PlayerContext);

  const startMutation = useStartGameMutation(game.id);

  const joinMutation = useJoinGameMutation(game.id);

  const joined = playerName && game.players.find((p) => p.name === playerName);

  return (
    <div>
      <h2>Lobby</h2>
      <p>
        <a href={window.location.href}>Game link</a> (share with friends)
      </p>
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
