import React, { Fragment, useContext } from "react";
import styled from "styled-components";
import { Direction, Game, GameWithId } from "../../common/types";
import { useKickMutation, useMoveMutation } from "./api";
import { PlayerContext } from "./App";

export function GameBoard({ game }: { game: GameWithId }) {
  const moveMutation = useMoveMutation(game.id);
  const kickMutation = useKickMutation(game.id);

  const handleShift = async (direction: Direction) => {
    await moveMutation.mutate({ direction });
  };

  const { playerName } = useContext(PlayerContext);

  const player = game.players.find((p) => p.name === playerName);
  const activePlayer = game.players[game.activePlayerIndex];

  const isActivePlayer = player?.name === activePlayer.name;

  return (
    <div>
      <h2>2048</h2>

      {player ? <p>Your score: {player.score}</p> : <p>You are spectating</p>}

      {isActivePlayer ? (
        <p>Your turn</p>
      ) : (
        <p>
          {activePlayer.name}'s turn{" "}
          <button
            onClick={() =>
              kickMutation.mutate({ playerName: activePlayer.name })
            }
          >
            Kick
          </button>
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
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  line-height: 60px;
  background: #89b6a2;
  border-radius: 3px;
  color: white;
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
