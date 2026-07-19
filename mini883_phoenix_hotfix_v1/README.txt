Mini883 Phoenix Hotfix v1
=========================

Fixes:
- Phoenix spin button remains/restores after WinAnimation.
- WinAnimation Promise cannot stall because of a missing callback or sound error.
- Does not reset or overwrite free-spin counters.
- Phoenix iframe uses real viewport fullscreen.
- Floating Lobby button remains visible.

Install:
1. Extract this ZIP into the Mini883 project root.
2. In the Mini883 terminal run:

   python3 patch_phoenix.py

3. Restart the local server if needed and reopen:

   http://localhost:5500/lobby.html

The script creates this backup automatically:

   games/phoenix-game/game.js.before-phoenix-hotfix-v1.bak
