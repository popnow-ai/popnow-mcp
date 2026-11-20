---
name: popnow-explainer
description: Make narrated explainer and faceless videos with PopNow through the connected PopNow MCP server - from a topic, a document or a script to scenes, narration, captions and music in one finished video. Use when the user wants an explainer, a faceless YouTube or TikTok video, a narrated story, a product walkthrough or a short documentary.
---

# Explainers and faceless videos with PopNow

PopNow records the narration, makes a picture or clip for every scene in one style and edits it all together. You write the script with the user; PopNow makes the media.

## Steps

1. Agree on the topic, the length, the shape (9:16 for phones, 16:9 for YouTube) and the audience in a sentence or two.
2. Write the script as scenes: one or two narration sentences per scene and a one-line picture idea for each. Keep facts to what the user gave you or what you can stand behind.
3. Pick a voice with `list_voices` if the user cares. For a fixed look, check `list_presets` or use a saved character (`list_characters`).
4. Call `make_explainer` with the scenes. It returns the price for the whole video and creates nothing until the user agrees: tell the user the total, wait for a clear yes, then call it again with `max_credits` set to that total.
5. Follow progress with `get_batch` and give the user the finished video link and the credits used.

For a cut of your own (your clips in your order, a music track, captions, a title), make the pieces with `create_image`, `create_video`, `create_speech` and `create_music`, then join them with `compose_video`, which is free. `reframe_video` makes other shapes for free.
