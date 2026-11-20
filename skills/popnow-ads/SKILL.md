---
name: popnow-ads
description: Make ads and brand content with PopNow through the connected PopNow MCP server - creator-style UGC ads, brand films and TV-style spots, marketing templates recreated with the user's product, story ads from studio templates, product shots from a product page, ad variants in bulk, and a hook score for a finished short video. Use when the user wants an ad, a product video, a UGC or unboxing clip, a brand film, a marketing visual, ad variations, or feedback on how well a video's opening grabs attention.
---

# Ads and brand content with PopNow

Everything here runs on the user's PopNow account through the `popnow` MCP server. PopNow does the directing on its side; your job is to collect the user's material, pass it in, show the plan and the total, and get a clear yes before anything paid runs. Follow each tool's description and the next steps it returns.

## Start from what the user has

| The user has | Do this first |
| --- | --- |
| a product page link | `import_product` to read the name, details and pictures |
| products, brand kits or characters saved on popnow.ai | `list_products`, `list_brands`, `list_characters` and pass the ids |
| photos on their device | `request_upload`, then `get_upload` |
| a popnow.ai/h/ link | `open_handoff` |

## Pick the format

| The user wants | Call |
| --- | --- |
| a creator-style ad (UGC, review, unboxing, how-to) | `make_ugc_ad` |
| a brand film or TV-style spot | `make_brand_film` |
| one of PopNow's marketing templates with their product | `list_studio_templates` (studio `marketing`), then `recreate_template`; `get_template_run` for progress, `resume_template_run` if it paused |
| a story ad from a studio template | `list_studio_templates`, `create_project`, `add_project_material`, `get_project_plan` (`revise_project_plan` for changes), `produce_project`, `get_project` |
| product photos or a set of static ads | `create_image` or `edit_image` with the product pictures; many at once with `run_batch` |
| the same ad in other shapes or languages | `reframe_video` (free), `translate_video`, or `run_batch` |
| to know if a video's first seconds work | `check_hook` |

## Paying

Multi-step pieces are priced as a whole. Starting a run or writing a plan returns the total (or a small plan fee) and creates nothing paid. Show the user the plan and the total in one message, wait for a clear yes, then continue with `max_credits` set to that total. If the plan changes, get the new total. Never set `max_credits` without the user's yes.

## People and products

People in photos the user brings need consent before they're used (the tool asks; set `consent: true` only after the user agrees). Use only products and brands the user owns or may advertise. Don't make claims about a product that the user hasn't given you.

## Results

These take a few minutes. Check with the tool's status action, `get_template_run`, `get_project` or `get_job`, and show the finished links and the credits used.
