import { useContext, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Direction, Game } from "../../common/types";
import { CreateGameBody } from "../../server/src/server";
import { PlayerContext } from "./PlayerContext";

/**
 * Fetches the specified game and subscribes to a websocket.
 */
export function useGameSubscription(id: string) {
  const res = useQuery<undefined, unknown, Game>({
    queryKey: ["game", id],
    queryFn: () => apiRequest("GET", `/api/game/${id}`),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const websocket = new WebSocket(
      `ws://${location.host}/api/game/${id}/subscribe`
    );
    websocket.addEventListener("error", (err) => {
      console.error("socket error", err);
    });
    websocket.addEventListener("message", (event) => {
      // Update the cache data stored by react-query. This will update the UI
      queryClient.setQueriesData(["game", id], JSON.parse(event.data));
    });
    return () => websocket.close();
  }, [queryClient]);

  return res;
}

type CreateGameResponse = { id: string };

export function useCreateGameMutation() {
  return useMutation<CreateGameResponse, unknown, CreateGameBody>({
    mutationKey: ["create-game"],
    mutationFn: (data) =>
      apiRequest<CreateGameResponse>("POST", "/api/game", data),
  });
}

export function useJoinGameMutation(gameId: string) {
  const { playerName } = useContext(PlayerContext);

  return useMutation<undefined, unknown, void>({
    mutationKey: ["join"],
    mutationFn: () =>
      apiRequest("POST", `/api/game/${gameId}/player`, { playerName }),
  });
}

export function useStartGameMutation(gameId: string) {
  return useMutation<undefined, unknown, void>({
    mutationKey: ["start"],
    mutationFn: () =>
      apiRequest("PUT", `/api/game/${gameId}`, { state: "STARTED" }),
  });
}

export function useMoveMutation(gameId: string) {
  const { playerName } = useContext(PlayerContext);
  return useMutation<undefined, unknown, { direction: Direction }>({
    mutationKey: ["move"],
    mutationFn: ({ direction }) =>
      apiRequest("POST", `/api/game/${gameId}/move`, { direction, playerName }),
  });
}

export function useKickMutation(gameId: string) {
  return useMutation<undefined, unknown, { playerName: string }>({
    mutationKey: ["kick"],
    mutationFn: (data) =>
      apiRequest("DELETE", `/api/game/${gameId}/player/${data.playerName}`),
  });
}

async function apiRequest<ResponseData>(
  method: string,
  url: string,
  data?: unknown
): Promise<ResponseData> {
  const res = await fetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers: { "content-type": "application/json" },
  });
  if (res.status > 399) {
    // TODO: better error handling, we're throwing away the server error here D:
    throw new Error("Unexpected response status");
  }
  return res.json();
}
