---
name: popnow-characters
description: Keep the same person, mascot or product across PopNow creations through the connected PopNow MCP server. Use when the user wants a consistent character, an AI influencer or spokesperson, their own face in new scenes, or the same product in every shot, or asks to save or reuse a character.
---

# Consistent characters with PopNow

A saved character keeps the same face, look or product across pictures and videos.

## Steps

1. Check what the user already has with `list_characters`.
2. To save a new one, call `create_character` with 1 to 10 clear pictures (public `https` links, `popnow://` links, or files from `request_upload` / `get_upload`). Photos of a real person need consent first: ask the user to confirm the person is them or agreed, and that nobody is under 18. If the tool asks for `consent`, set it to `true` only after they confirm.
3. Pass the `character_id` to `create_image`, `edit_image`, `create_video`, `create_video_from_references`, `copy_motion`, `make_talking_avatar` or `make_explainer`.
4. Paid steps follow the usual rule: tell the user the price, wait for a yes, then call again with `max_credits`.

No character pictures yet? Make a few with `create_image` first, let the user pick the ones they like, then save those.
