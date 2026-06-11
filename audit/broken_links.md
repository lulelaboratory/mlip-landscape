# Broken Links Report

Tracks the reachability of outbound links in the model data (`githubUrl`,
`paperUrl`, and any `verifiedSources` / dataset `sourceUrl` / `paperUrl`).

- A future link-checker script should populate the rows between the `AUTOGEN`
  markers (one row per non-2xx / unreachable URL), leaving this header and the
  table head intact. An empty table means no broken links were found on the
  last run.
- `http status` is the final status code after redirects (or `error` for
  network/DNS/timeout failures).

_Last updated: 2026-06-06 (manual). Automated link checking not yet run._

<!-- AUTOGEN:START broken-links -->
| model id | field | url | http status | checked on |
| --- | --- | --- | --- | --- |
<!-- AUTOGEN:END broken-links -->
