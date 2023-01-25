import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Direction, Game } from "../../common/types";
import { CreateGameBody, ShiftBoardBody } from "../../server/src/server";
import { PlayerContext } from "./PlayerContext";

export function usePollGameQuery(id: string) {
  return useQuery<undefined, unknown, Game>({
    queryKey: ["game", id],
    queryFn: () => apiRequest("GET", `/api/game/${id}`),
    refetchInterval: 1000,
  });
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
  const queryClient = useQueryClient();
  const { playerName } = useContext(PlayerContext);

  return useMutation<undefined, unknown, void>({
    mutationKey: ["join"],
    mutationFn: () =>
      apiRequest("POST", `/api/game/${gameId}/player`, { playerName }),
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
  });
}

export function useStartGameMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation<undefined, unknown, void>({
    mutationKey: ["start"],
    mutationFn: () =>
      apiRequest("PUT", `/api/game/${gameId}`, { state: "STARTED" }),
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
  });
}

export function useMoveMutation(gameId: string) {
  const queryClient = useQueryClient();
  const { playerName } = useContext(PlayerContext);
  return useMutation<undefined, unknown, { direction: Direction }>({
    mutationKey: ["move"],
    mutationFn: ({ direction }) =>
      apiRequest("POST", `/api/game/${gameId}/move`, { direction, playerName }),
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
  });
}

export function useKickMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation<undefined, unknown, { playerName: string }>({
    mutationKey: ["kick"],
    mutationFn: (data) =>
      apiRequest("DELETE", `/api/game/${gameId}/player/${data.playerName}`),
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
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
    throw new Error("Unexpected response status");
  }
  return res.json();
}
