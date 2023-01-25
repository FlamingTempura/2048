import React, { Fragment, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Game, GameWithId } from "../../common/types";
import { useMoveMutation } from "./api";
import { GameBoardGrid } from "./GameBoardGrid";
import { PlayerContext } from "./PlayerContext";
import { ScoreBoard } from "./ScoreBoard";

export function GameBoard({ game }: { game: GameWithId }) {
  const { playerName } = useContext(PlayerContext);
  const moveMutation = useMoveMutation(game.id);

  const player = game.players.find((p) => p.name === playerName);
  const activePlayer = game.players[game.activePlayerIndex];
  const spectating = !player;

  const isActivePlayer = player?.name === activePlayer.name;

  const [showPlayerWarning, setShowPlayerWarning] = useState(false);

  useEffect(() => {
    if (game.state === "ENDED") {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isActivePlayer) {
        setShowPlayerWarning(true);
        setTimeout(() => setShowPlayerWarning(false), 2000);
        return;
      }
      switch (e.key) {
        case "ArrowUp":
          moveMutation.mutate({ direction: "N" });
          break;
        case "ArrowRight":
          moveMutation.mutate({ direction: "E" });
          break;
        case "ArrowDown":
          moveMutation.mutate({ direction: "S" });
          break;
        case "ArrowLeft":
          moveMutation.mutate({ direction: "W" });
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isActivePlayer, moveMutation, game.state]);

  return (
    <div>
      <h2>2048</h2>

      {game.state === "ENDED" ? (
        <>
          <GameEndBanner game={game} playerName={playerName} />
        </>
      ) : (
        <>
          {spectating ? (
            <p>You are spectating</p>
          ) : (
            <p>{isActivePlayer ? "Your turn" : "Wait for other players..."}</p>
          )}
        </>
      )}

      <Container>
        <GameBoardContainer>
          <GameBoardGrid game={game} />
          {showPlayerWarning && <PlayerWarning>Wait your turn!</PlayerWarning>}
        </GameBoardContainer>
        <ScoreBoard
          game={game}
          allowKick={!spectating && game.state === "STARTED"}
          gameEnded={game.state === "ENDED"}
        />
      </Container>
    </div>
  );
}

function GameEndBanner({
  game,
  playerName,
}: {
  game: GameWithId;
  playerName: string;
}) {
  const isWon = game.board.flat().some((cell) => cell >= 2048);
  const winner = game.players.sort((a, b) => b.score - a.score)[0];

  return (
    <>
      <p>Game ended</p>
      {isWon ? (
        <>
          <h1>
            {winner.name === playerName ? "You won!" : `${winner.name} won!`}
          </h1>
        </>
      ) : (
        <h1>You lost</h1>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  gap: 24px;
`;

const GameBoardContainer = styled.div``;

const PlayerWarning = styled.div`
  display: block;
  background: white;
  border-radius: 4px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  transform: translateY(-120px);
  margin: 0 80px;
`;
