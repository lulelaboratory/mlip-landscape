# References Audit Report

Tracks verification of each model's citations (`paperUrl`, `githubUrl`,
`verifiedSources`) against the actual sources. The goal is that every claim
surfaced on the site is backed by a source that a curator (or a future script)
has actually checked.

- **Status legend:** `verified` (source checked, supports the entry) ·
  `mismatch` (source does not support the claimed metadata) ·
  `unreachable` (link failed) · `pending` (not yet checked).
- This file is intended to be machine-writable: a future audit script should
  replace only the rows between the `AUTOGEN` markers, leaving this header and
  the table head intact.

_Last updated: 2026-06-11 (manual). 4 references audited so far (abstract level)._

<!-- AUTOGEN:START references -->
| model id | reference (url/doi) | reference type | status | checked on | notes |
| --- | --- | --- | --- | --- | --- |
| mace | https://arxiv.org/abs/2206.07697 | paper | verified | 2026-06-11 | Confirmed as the MACE *architecture* paper (rMD17/3BPA/AcAc benchmarks; no universal/foundation claims). Abstract-level check via web search (llm_assisted); full-text review pending. |
| mace_mp0 | https://arxiv.org/abs/2401.00096 | paper | verified | 2026-06-11 | Title "A foundation model for atomistic materials chemistry"; MPtrj training set confirmed. Abstract-level check (llm_assisted); full-text review pending. |
| sevennet_nano | https://arxiv.org/abs/2604.10887 | paper | verified | 2026-06-11 | Title "A Lightweight Universal MLIP via Knowledge Distillation for Scalable Atomistic Simulations"; distilled from SevenNet-Omni. Abstract-level check (llm_assisted); full-text review pending. |
| sevennet_omni | https://arxiv.org/abs/2510.11241 | paper | verified | 2026-06-11 | Cross-domain universal MLIP; called "a large multi-task foundation model" in arXiv:2604.10887 abstract; public checkpoint on figshare. Abstract-level check (llm_assisted); full-text review pending. |
<!-- AUTOGEN:END references -->
