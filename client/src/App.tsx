import React, { createContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider, QueryClient } from "react-query";
import { StartScreen } from "./StartScreen";
import { Route, BrowserRouter } from "react-router-dom";
import { Routes } from "react-router";
import { GameScreen } from "./GameScreen";

const client = new QueryClient();

const LOCAL_STORE_KEY = "2048PlayerName";

function App() {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem(LOCAL_STORE_KEY) ?? ""
  );

  useEffect(() => {
    localStorage.setItem(LOCAL_STORE_KEY, playerName);
  }, [playerName]);

  return (
    <QueryClientProvider client={client}>
      <PlayerContext.Provider value={{ playerName, setPlayerName }}>
        <BrowserRouter>
          <Routes>
            <Route path="/game/:id" element={<GameScreen />} />
            <Route path="/" element={<StartScreen />} />
          </Routes>
        </BrowserRouter>
      </PlayerContext.Provider>
    </QueryClientProvider>
  );
}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);

export const PlayerContext = createContext<{
  playerName: string;
  setPlayerName: (name: string) => void;
}>({ playerName: "", setPlayerName: () => undefined });
