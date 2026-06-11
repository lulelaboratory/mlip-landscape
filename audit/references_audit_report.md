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

_Last updated: 2026-06-11 (manual). 15 references audited so far (abstract level): 4 model papers, 2 model cards/repos, 3 dataset papers, 6 edge relationships (5 verified, 1 left pending)._

<!-- AUTOGEN:START references -->
| model id | reference (url/doi) | reference type | status | checked on | notes |
| --- | --- | --- | --- | --- | --- |
| mace | https://arxiv.org/abs/2206.07697 | paper | verified | 2026-06-11 | Confirmed as the MACE *architecture* paper (rMD17/3BPA/AcAc benchmarks; no universal/foundation claims). Abstract-level check via web search (llm_assisted); full-text review pending. |
| mace_mp0 | https://arxiv.org/abs/2401.00096 | paper | verified | 2026-06-11 | Title "A foundation model for atomistic materials chemistry"; MPtrj training set confirmed. Abstract-level check (llm_assisted); full-text review pending. |
| sevennet_nano | https://arxiv.org/abs/2604.10887 | paper | verified | 2026-06-11 | Title "A Lightweight Universal MLIP via Knowledge Distillation for Scalable Atomistic Simulations"; distilled from SevenNet-Omni. Abstract-level check (llm_assisted); full-text review pending. |
| sevennet_omni | https://arxiv.org/abs/2510.11241 | paper | verified | 2026-06-11 | Cross-domain universal MLIP; called "a large multi-task foundation model" in arXiv:2604.10887 abstract; public checkpoint on figshare. Abstract-level check (llm_assisted); full-text review pending. |
| dataset:omol25 | https://arxiv.org/abs/2505.08762 | dataset paper | verified | 2026-06-11 | "The Open Molecules 2025 (OMol25) Dataset" (Meta FAIR); >100M ωB97M-V DFT calcs, ~83 elements. Abstract-level check (llm_assisted); license still to confirm. |
| dataset:omat24 | https://arxiv.org/abs/2410.12771 | dataset paper | verified | 2026-06-11 | "Open Materials 2024 (OMat24)" (Meta FAIR); >100M DFT on inorganic bulk; CC-BY-4.0. Abstract-level check (llm_assisted). |
| dataset:oc20 | https://arxiv.org/abs/2010.09990 | dataset paper | verified | 2026-06-11 | "The Open Catalyst 2020 (OC20) Dataset and Community Challenges"; ~1.28M DFT relaxations. Abstract-level check (llm_assisted); license still to confirm. |
| edge:mace→mace_mp0 | https://arxiv.org/abs/2401.00096 | paper | verified | 2026-06-11 | MACE-MP-0 is a single MACE-architecture potential trained on MPtrj. Abstract-level check (llm_assisted). |
| edge:sevennet_omni→sevennet_nano | https://arxiv.org/abs/2604.10887 | paper | verified | 2026-06-11 | SevenNet-Nano distilled from the SevenNet-Omni teacher via knowledge distillation. Abstract-level check (llm_assisted). |
| edge:esen→uma | https://arxiv.org/abs/2506.23971 | paper | verified | 2026-06-11 | "The UMA architecture is based on eSEN" (UMA paper). Abstract-level check (llm_assisted). |
| edge:sevennet→sevennet_omni | https://arxiv.org/abs/2510.11241 | paper | verified | 2026-06-11 | SevenNet-Omni ships in the official MDIL-SNU/SevenNet codebase; called a SevenNet-family foundation model in arXiv:2604.10887. SevenNet-MF backbone detail pending full-text check. |
| edge:tfn→nequip | https://arxiv.org/abs/2101.03164 | paper | pending | 2026-06-11 | NOT marked verified: search confirmed NequIP's E(3)-equivariant tensor convolutions but not the explicit TFN citation claim in the edge description. Stays "probable". |
| orbmol_v2 | https://huggingface.co/Orbital-Materials/orbmol-v2 | model card | verified | 2026-06-11 | Official HF card: per-atom electrostatics (LatentChargeHead, CoulombModule, ChargeSpinConditioner), OMol25+OPoly26 training, Apache-2.0, GSCDB138 developer claim. Corroborated across two independent search passes (direct fetch blocked by network policy); full card review pending. |
| orbmol_v2 | https://github.com/orbital-materials/orb-models | code repo | verified | 2026-06-11 | Official orb-models repo / release notes (May 2026 release; `pretrained.orbmol_v2`). Search-level check (llm_assisted). |
| orbmol_v2 | arXiv:2505.08762 (REJECTED) | paper | mismatch | 2026-06-11 | A search summary attributed this arXiv ID to an "OrbMol-v2 paper" — it is actually the OMol25 dataset paper. Rejected; no paper is cited for OrbMol-v2. |
| edge:orbmol→orbmol_v2 | https://huggingface.co/Orbital-Materials/orbmol-v2 | model card | verified | 2026-06-11 | "OrbMol-v2 extends the OrbMol architecture with learnable per-atom electrostatics" — corroborated twice. |
| dataset:opoly26 | (none recorded) | dataset | pending | 2026-06-11 | OPoly26 (Open Polymers 2026, ~6.57M DFT on capped polymer substructures) known only from secondary summaries; no URL recorded until a primary source is checked. |
<!-- AUTOGEN:END references -->
