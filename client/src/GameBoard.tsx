import React, { Fragment, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Game, GameWithId } from "../../common/types";
import { useMoveMutation } from "./api";
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
        setTimeout(() => {
          setShowPlayerWarning(false);
        }, 2000);
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
        default:
          console.log(e);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isActivePlayer, moveMutation, game.state]);

  const highScorer = game.players.sort((a, b) => b.score - a.score)[0];

  return (
    <div>
      <h2>2048</h2>

      {game.state === "ENDED" ? (
        <>
          <p>Game ended</p>
          <h1>{highScorer.name} wins! </h1>
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

function GameBoardGrid({ game }: { game: Game }) {
  return (
    <Grid size={game.size}>
      {game.board.map((row, y) => (
        <Fragment key={y}>
          {row.map((cell, x) => (
            <Cell key={x} style={{ background: getColor(cell) }}>
              {cell}
            </Cell>
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
  gap: 8px;
`;

const Cell = styled.div`
  font-size: 22px;
  text-align: center;
  font-weight: bold;
  line-height: 60px;
  background: #89b6a2;
  border-radius: 3px;
  color: white;
`;

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

function getColor(num: number): string {
  const n = Math.floor(Math.log2(num));
  return colors[Math.min(n - 1, colors.length - 1)];
}

const colors = [
  "#00A99F",
  "#119EA1",
  "#2194A4",
  "#3289A6",
  "#427EA9",
  "#5373AB",
  "#6369AE",
  "#745EB0",
  "#8553B2",
  "#9549B5",
  "#A63EB7",
  "#B633BA",
  "#C728BC",
  "#D71EBF",
  "#E813C1",
];
