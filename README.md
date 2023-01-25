# 2048

Multiplayer 2048 with customizable grid size.

https://user-images.githubusercontent.com/1085434/214649361-6ad0a901-da92-4236-919e-af2e452ca9b2.mp4

Install:

```
npm install
```

Run:

```
npm start
```

Go to http://locahost:8090 . Enjoy.

## Architecture

The Node/Typescript server comprises a REST API and WebSocket to subscribe to changes to the game. State is stored in memory (see limitations below).

Frontend is React/Typescript.

A builder is provided (build.ts) to compile and run the server and client code. It also watches for changes and recompiles. Why this and not webpack? Mostly just wanted to try out esbuild, but it's nice to have something that's pretty config-free.

Is the code the cleanest I could do? No - there are areas I'd love to clean up. Look at GameEndBanner and see those nested ternaries :'( . And while I tried to keep things pure and functional in puzzle.ts, I resorted to lodash `cloneDeep` in a few places. But at 6 hours I had to say stop and I'm pretty happy with how it's ended up.

Fun project - enjoyed reminding myself of this game.

## Limitations:

Plenty of constraints to this application that would need to be addressed before release:

- State persistence: game state is persisted in memory with a JSON dump we recover each time we start the application. Lots of reasons this is bad:

  1. memory footprint will grow linearly for each game started (even finished games continue to take up space).
  2. multiple concurrent writes are possible, corrupting data.
  3. file will get huge and JSON parse is going to take ages to parse.

  Lots of alternatives; key-value store may be good enough for this application, though if we consider user accounts then a relational database may be more advantageous.

- Player spoofing: anybody could spoof the current player's turn simply by providing the player's name to the move endpoint. Perhaps consider some kind of session token to ensure we can't just spoof another player because we know their name.

- Websocket won't reconnect on disconnect, which pretty much makes it unsuitable for mobile. There are off-the-shelf solutions such as Socket.io that handle reconnection.

- No testing. Would love to have done some unit tests on puzzle.ts and integration tests on the hooks. I'd also consider a cypress test, though not sure how easy it will be to simulate multiple players in a single game.

- Error handling is pretty poor. Any server error just gets thrown away and a general "Unexpected response status" get's shown to the user.

- BUG: Impossible moves - ie where no tiles can move in the direction requested - are possible.

- Aesthetics: Needs more consistent look and feel (e.g. buttons look pretty inconsistent), animations of cells as they shift would also be great
