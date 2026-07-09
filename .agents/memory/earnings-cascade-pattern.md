---
name: Forward-only cascading metric edits
description: How to let admins edit a rolling-window metric (today/7d/30d/all-time) so smaller windows cascade forward into larger ones, but never backward.
---

When a dashboard has nested time-window totals (e.g. today -> 7-day -> 30-day -> all-time) and admins can manually overwrite any of them, don't derive every window by summing a ledger over date ranges — a single-row ledger makes larger windows collapse to the same value as the smallest one, and "delta the smallest window to hit a target for a larger one" (subtracting the delta from the base value) leaks backward into smaller windows.

**Fix:** store each window as `previous_window + manually_set_extra`, with one singleton row of `*_extra` columns (one per window above the base). Editing the base (e.g. today) naturally cascades forward since every larger window adds on top of it. Editing a larger window only solves for its own `extra` (`newExtra = targetAmount - previousWindowValue`), so it can never reach backward into a smaller window.

**Why:** a user explicitly reported the bug this pattern fixes — editing 7-day/30-day was silently changing "today" too, because the old implementation applied the edit as a delta to the base ledger value.

**How to apply:** any admin UI where multiple derived rollups must be independently overridable with one-directional cascade (smaller -> larger, never larger -> smaller).
