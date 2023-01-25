import React, { createContext, useState, useEffect, ReactNode } from "react";

const LOCAL_STORE_KEY = "2048PlayerName";

export const PlayerContext = createContext<{
  playerName: string;
  setPlayerName: (name: string) => void;
}>({ playerName: "", setPlayerName: () => undefined });

/**
 * Stores the player's current name and persists it in local storage
 */
export function PlayerContextProvider({ children }: { children: ReactNode }) {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem(LOCAL_STORE_KEY) ?? ""
  );

  useEffect(() => {
    localStorage.setItem(LOCAL_STORE_KEY, playerName);
  }, [playerName]);

  return (
    <PlayerContext.Provider value={{ playerName, setPlayerName }}>
      {children}
    </PlayerContext.Provider>
  );
}
