## Limitations:

As this was a time-boxed exercise, there are plenty of constraints to this application that would need to be addressed before release:

- State persistence: game state is persisted in memory with a JSON dump we can recover each time we start the application. Lots of reasons to not do this:

  1. multiple concurrent writes are possible, corrupting data.
  2. file will get huge and JSON parse is going to take ages to parse.
  3. memory footprint will grow linearly for each game started (even finished games continue to take up space).

  Lots of alternatives; key-value store may be good enough for this application, though if we consider user accounts then a relationship database may be more advantageous.

- Lack of server-side validation: content sent to REST endpoints is not validated. Incorrect information could corrupt a game.

- Player spoofing: anybody could spoof the current player's turn simply by overriding the UI's constraint. Need's server-side check to ensure the user who made the move is the current user. Even then, may need to have some kind of session token to ensure we can't just spoof another player because we know their name.

- Make usernames unique - currently a user could join a game with the same username as someone else, breaking the game.

- Websocket

- Testing

- Error handling
