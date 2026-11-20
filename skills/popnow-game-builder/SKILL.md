---
name: popnow-game-builder
description: Build browser games with PopNow and put them online through the connected PopNow MCP server - you write the game, PopNow makes the art and sound and hosts it at a link anyone can play. Use when the user wants a small game that runs in the browser, game sprites, backgrounds, music or sound effects for a game, or to update or list a game they made.
---

# Game Builder: build and ship browser games

PopNow hosts static browser games at a play link anyone can open (`popnow.ai/play/<id>`).

## What PopNow can host

- Static files only: HTML, JavaScript, CSS, JSON, SVG and shaders as text, up to 2 MB of text, with `index.html` at the top level.
- Pictures, audio, video and 3D models come from PopNow results (`popnow://` links) and are copied into the game.
- The game runs in a sandbox on its own domain. It can load scripts and fonts from cdn.jsdelivr.net, cdnjs.cloudflare.com, unpkg.com, esm.sh and Google Fonts. It can't call other servers, use cookies, open pop-ups or register service workers.
- No server code, logins, payments or multiplayer backends. If the user needs those, say PopNow game hosting can't do it.

## Steps

1. Agree on the idea in a sentence or two: what the player does, how to win or lose, and controls for keyboard and touch.
2. Write the game yourself, as a single `index.html` when it fits (more files are fine). Use relative paths such as `assets/background.png`. In a coding agent, keep the files in the user's project so they can edit them later.
3. Art and sound, only if the user wants them: make each piece with a PopNow tool (`create_image`, `remove_background` for sprites, `create_music`, `create_sound_effects`, `create_3d`). Group several pictures with `run_batch` for one price. Paid calls follow the usual rule: tell the user the price, wait for a yes, then call again with `max_credits`.
4. Put it online: call `deploy_game` with every text file in `files` and each path your code loads mapped to its `popnow://` link in `assets` (match the extension to the kind of file: .png or .webp for pictures, .mp3 for audio, .mp4 for video, .glb for 3D). Deploying uses no credits.
5. Give the user the play link. To ship a fix, call `deploy_game` again with the same `game_id`; the new version replaces the one at the link, so check with the user first.
6. Only if the user asks to list it publicly: call `publish_game` with a title, a one- or two-sentence description and a cover picture. It is reviewed before it appears in the PopNow game market; until then it stays playable by its link.
