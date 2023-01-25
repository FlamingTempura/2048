import React, { useContext, useMemo } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Game } from "../../common/types";
import { PlayerContext } from "./App";
import { GameBoard } from "./GameBoard";
import { LobbyScreen } from "./Lobby";

export function GameScreen() {
  const { id } = useParams();

  const queryKey = useMemo(() => ["game", id], [id]);

  const gameQuery = useQuery<undefined, unknown, Game>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/game/${id}`);
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    cacheTime: 0,
    refetchInterval: 1000,
  });

  if (gameQuery.status === "loading") {
    return <p>Loading...</p>;
  }
  if (gameQuery.status === "error") {
    return <p>Error! {String(gameQuery.error)}</p>;
  }

  if (gameQuery.status === "idle") {
    return <>Idle</>; // FIXME
  }

  switch (gameQuery.data.state) {
    case "LOBBY":
      return <LobbyScreen game={gameQuery.data} gameQueryKey={queryKey} />;
    case "STARTED":
      return <GameBoard game={gameQuery.data} gameQueryKey={queryKey} />;
    case "ENDED":
      return <p>This game has ended</p>;
  }
}
