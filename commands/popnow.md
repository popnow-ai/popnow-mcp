---
name: popnow
description: Create, edit and manage images, video, music, voiceovers, ads, explainers and browser games with your PopNow account.
---

# /popnow

Natural-language entry point for PopNow. Read the request, keep every constraint the user gave (length, shape, model, budget, language), and use the PopNow MCP tools to do it.

## Usage

```
/popnow <what you want>
```

## Examples

```
/popnow A cinematic poster of a lighthouse in a storm, 16:9
/popnow Animate this product photo with a slow push-in, 5 seconds, vertical: https://example.com/bottle.png
/popnow A 30-second narrated explainer about how bees make honey
/popnow A creator-style ad for my coffee brand, show me the total first
/popnow Build a tiny browser game where a cat catches falling fish and put it online
/popnow How many credits do I have left?
```

## Routing

- One picture, video, song, voiceover or edit: follow the `popnow-create` skill.
- Ads, product videos, brand films, marketing templates, hook checks: follow `popnow-ads`.
- Narrated explainers and faceless videos: follow `popnow-explainer`.
- The same person, mascot or product across creations: follow `popnow-characters`.
- Browser games: follow `popnow-game-builder`.

Always tell the user the price and wait for a yes before a paid run that asks for confirmation. Never invent tool names, model ids or presets when the PopNow tools can list them. If no PopNow tools are available, tell the user to connect the server first (see the README).
