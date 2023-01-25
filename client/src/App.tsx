import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider, QueryClient } from "react-query";
import { StartScreen } from "./StartScreen";
import { Route, BrowserRouter } from "react-router-dom";
import { Routes } from "react-router";
import { GameScreen } from "./GameScreen";

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/game/:id" element={<GameScreen />} />
          <Route path="/" element={<StartScreen />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
