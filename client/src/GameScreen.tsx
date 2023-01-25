import React from "react";
import { useParams } from "react-router-dom";
import { GameWithId } from "../../common/types";
import { usePollGameQuery } from "./api";
import { GameBoard } from "./GameBoard";
import { LobbyScreen } from "./Lobby";

export function GameScreen() {
  const { id } = useParams();

  const gameQuery = usePollGameQuery(id);

  if (gameQuery.status === "loading" || gameQuery.status === "idle") {
    return <p>Loading...</p>;
  }

  if (gameQuery.status === "error") {
    return <p>Error! {String(gameQuery.error)}</p>;
  }

  const game: GameWithId = { ...gameQuery.data, id };

  switch (gameQuery.data.state) {
    case "LOBBY":
      return <LobbyScreen game={game} />;
    case "STARTED":
    case "ENDED":
      return <GameBoard game={game} />;
  }
}
