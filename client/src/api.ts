import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Direction, Game } from "../../common/types";
import { PlayerContext } from "./App";

export function usePollGameQuery(id: string) {
  return useQuery<undefined, unknown, Game>({
    queryKey: ["game", id],
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
}

export function useMoveMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation<undefined, unknown, { direction: Direction }>({
    mutationKey: ["move"],
    mutationFn: async (data) => {
      const res = await fetch(`/api/game/${gameId}/move`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
  });
}

export function useKickMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation<undefined, unknown, { playerName: string }>({
    mutationKey: ["kick"],
    mutationFn: async (data) => {
      const res = await fetch(`/api/game/${gameId}/player/${data.playerName}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
  });
}

export function useStartGameMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation<undefined, unknown, void>({
    mutationKey: ["start"],
    mutationFn: async () => {
      const res = await fetch(`/api/game/${gameId}`, {
        method: "PUT",
        body: JSON.stringify({ state: "STARTED" }),
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
  });
}

export function useJoinGameMutation(gameId: string) {
  const queryClient = useQueryClient();
  const { playerName } = useContext(PlayerContext);

  return useMutation<undefined, unknown, void>({
    mutationKey: ["join"], // FIXME
    mutationFn: async () => {
      const res = await fetch(`/api/game/${gameId}/player`, {
        method: "POST",
        body: JSON.stringify({ playerName }),
        headers: { "content-type": "application/json" },
      });
      if (res.status !== 200) {
        throw new Error("Unexpected response status");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["game", gameId]),
  });
}
