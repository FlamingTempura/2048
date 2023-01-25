import React, { useContext } from "react";
import styled from "styled-components";
import { GameWithId, Player } from "../../common/types";
import { useKickMutation } from "./api";
import { PlayerContext } from "./PlayerContext";

export function ScoreBoard({
  game,
  allowKick,
  gameEnded,
}: {
  game: GameWithId;
  allowKick: boolean;
  gameEnded: boolean;
}) {
  const { playerName } = useContext(PlayerContext);
  const activePlayer = game.players[game.activePlayerIndex];

  return (
    <ScoreBoardContainer>
      <Header>Scores</Header>
      <ScoreBoardList>
        {game.players.map((player) => (
          <PlayerScoreEntry
            key={player.name}
            player={player}
            gameId={game.id}
            isYou={player.name === playerName}
            isPlayersTurn={!gameEnded && player.name === activePlayer.name}
            allowKick={allowKick}
          />
        ))}
      </ScoreBoardList>
    </ScoreBoardContainer>
  );
}

function PlayerScoreEntry({
  gameId,
  player,
  isPlayersTurn,
  isYou,
  allowKick,
}: {
  gameId: string;
  player: Player;
  isPlayersTurn: boolean;
  isYou: boolean;
  allowKick: boolean;
}) {
  const kickMutation = useKickMutation(gameId);

  return (
    <ScoreBoardListItem>
      <Name>
        {player.name} {isYou ? "(You)" : null}
        {isPlayersTurn && (
          <PlayerTurn>{isYou ? "Take your turn" : "Taking turn"}</PlayerTurn>
        )}
      </Name>
      <Score>{player.score}</Score>
      {allowKick && (
        <KickButton
          onClick={() => kickMutation.mutate({ playerName: player.name })}
        >
          {isYou ? "Leave" : "Kick"}
        </KickButton>
      )}
    </ScoreBoardListItem>
  );
}

const ScoreBoardContainer = styled.div``;

const Header = styled.h4`
  margin: 0 0 12px 0;
`;

const ScoreBoardList = styled.ul`
  list-style: none;
  display: grid;
  padding: 0;
  grid-template-columns: 1fr 5ch 60px;
  width: 260px;
  gap: 12px;
`;

const ScoreBoardListItem = styled.li`
  display: contents;
`;

const Name = styled.span`
  grid-column: 1;
`;

const Score = styled.span`
  grid-column: 2;
  text-align: right;
`;

const KickButton = styled.button`
  grid-column: 3;
  align-self: start;
  border: 1px solid #34495e;
  background: transparent;
  border-radius: 3px;
  font-size: 12px;
  padding: 2px;
`;

const PlayerTurn = styled.em`
  display: block;
`;
