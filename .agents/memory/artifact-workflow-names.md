---
name: Workflow naming in artifacts monorepo
description: How to find the actual restart_workflow / listWorkflows name for an artifact's service.
---

Workflow names shown by `listWorkflows()` / `restart_workflow` are `<artifact-directory>: <service-name>`, e.g. `artifacts/affiltrak: web` or `artifacts/api-server: API Server` — derived from the artifact's directory path and the `[[services]] name` field in its `.replit-artifact/artifact.toml`, NOT the artifact's human-readable `title`.

**Why:** Guessing the workflow name from the artifact title (e.g. "AffilTrak" or "API Server") fails with `RUN_COMMAND_NOT_FOUND` even though a workflow for that service exists.

**How to apply:** Before calling `restart_workflow`, call `listWorkflows()` (via code_execution) to get the exact registered name, especially right after an artifact is newly created and hasn't been restarted yet.
