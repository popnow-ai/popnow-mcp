---
name: popnow-create
description: Make and edit pictures, videos, music, voiceovers, sound effects and 3D models with PopNow through the connected PopNow MCP server. Use when the user asks to generate an image, edit or restyle a photo, animate a picture, make or edit a video, write a song, record a voiceover, add sound, transcribe audio, make a 3D model, put results on a canvas, or check credits and past creations. For ads and brand pieces use popnow-ads; for narrated explainers use popnow-explainer; for consistent people or products use popnow-characters; for browser games use popnow-game-builder.
---

# Create with PopNow

PopNow runs on the user's PopNow account through the `popnow` MCP server (`https://api.popnow.ai/mcp`, OAuth sign-in). Pick the tool that fits, check options when the user wants a specific look or model, and get the user's yes to the price before anything paid runs. The tool descriptions on the server are the source of truth: if a tool, parameter or default here differs from what the server lists, follow the server.

If no PopNow tools are available, the server isn't connected yet. Tell the user to add it (for example `claude mcp add --transport http popnow https://api.popnow.ai/mcp`, then `/mcp` to sign in) and stop.

## Pick the tool

| The user wants | Call |
| --- | --- |
| a new picture, poster, product shot | `create_image` (`style` for a ready-made look, `character_id` for a saved character, `model` to pick a model) |
| to change a photo: new outfit, background, style | `edit_image` |
| a one-step photo fix | `remove_background`, `upscale`, `erase_object`, `expand_image`, `change_camera_angle`, `change_pose`, `relight_photo`, `remove_shadow`, `anime_to_real`, `split_layers` |
| a ready-made look or a trending effect | `list_presets`, then `create_image` with `style` or `apply_effect` |
| a video from words or a photo | `create_video`; several reference pictures: `create_video_from_references` |
| to change a video | `edit_video`; one thing only (a color, an object, the background): `edit_video_region`; longer: `extend_video`; new shape: `reframe_video` (free); sharper: `upscale` |
| someone to move like another video | `copy_motion` |
| a sketch or marked-up photo brought to life | `draw_to_video` |
| a song or jingle | `create_music` (pass `lyrics` only when the user wrote them) |
| a voiceover or narration | `list_voices`, then `create_speech` with the user's exact words |
| sound effects; sound for a silent video | `create_sound_effects`; `add_sound` |
| a new voice on a recording, dubbing, lip-sync, a talking presenter | `change_voice`, `translate_video`, `lip_sync`, `make_talking_avatar` |
| speech to text | `transcribe_audio` |
| a 3D model | `create_3d` (`rig_3d` and `list_animations` say when rigging is available) |
| one finished edit from several results | `compose_video` (free) |
| many versions at once | `run_batch` with the same tool, then `get_batch` |
| a better prompt for a chosen model | `optimize_prompt` |
| a board for a project | `list_canvases`, `get_canvas`, `add_to_canvas`, `open_canvas` |
| a whole multi-step piece | `list_playbooks`, then `use_playbook`; `run_playbook_step` when a step says PopNow makes it |
| something built in a named style (launch video, deck, landing page) | `find_skills`, show the previews, let the user pick, then `use_skill` |
| their saved recipes or skills from popnow.ai | `list_my_recipes` / `run_my_recipe` / `get_recipe_run` / `resume_recipe_run`; `list_my_skills` / `use_my_skill` |
| a popnow.ai/h/ link | `open_handoff` first |
| credits, past creations, one library item | `check_balance`, `list_my_creations`, `get_asset`; keep a result for good: `save_to_library` |

Don't turn a simple request into a multi-step workflow. When the user names a model or wants the best one for a job, call `list_models` (category `image`, `video` or `audio`) and pass its id as `model`. Never invent tool names, model ids or presets.

## Paying

1. Call the paid tool. Small jobs start right away; larger ones come back with the price and "needs confirmation" and create nothing.
2. Before a job you expect to be large (videos, batches, multi-step pieces), call `estimate_cost` with the same arguments and tell the user the price first.
3. When a tool asks for confirmation, tell the user the price in one short line and wait for a clear yes. Then call the same tool again with the same arguments plus `max_credits` set to that price.
4. Never set `max_credits` yourself without the user's yes. If the arguments change, get a new price.
5. After each creation, say how many credits it used. If the balance is too low, say so and stop.

## People in what the user brings

Photos, videos or recordings of real people that the user brings need their consent before a tool turns them into something new. When a tool asks, ask the user in one message to confirm that any real person shown is them or agreed, that nobody is under 18, and that it won't be used to mislead anyone. Set `consent: true` only after they agree. Talking presenters, dubbing, lip-sync and voice changes always ask. Results PopNow made earlier don't need it.

## Files

Media inputs take a public `https` link or a `popnow://` link from an earlier result. For files on the user's computer or phone, call `request_upload`, give the user the link, then call `get_upload` to get their `popnow://` links. Reuse earlier results by their `popnow://` links ("now animate that picture").

## Results

Videos and multi-step pieces take a minute or more. When a tool returns a `job_id`, call `get_job` (or `get_batch`) until it's done; never say something is finished while it's still queued or failed. Show the links. Everything is also saved in the user's PopNow library.

## Not PopNow

Bookings, buying or delivering products, live prices, news and other facts: don't call any PopNow tool; say PopNow can't do it.
