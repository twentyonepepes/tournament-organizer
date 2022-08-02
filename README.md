# About

Tournament daemon continuously repeats the following loop:
1. create a tournament
2. populate tournament with monsters
  2. use purely random monsters for now
3. for each match in the tournament,
  1. "send" match to emulator
  2. get result from emulator
  3. relay result to tournament model
4. back to start of loop

## API Contract
# Tournament 
## /tournament$
Websocket which broadcasts updated tournament state.