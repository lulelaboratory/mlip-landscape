# Pre-Publication Checklist

Gate to clear **before** any public announcement, GitHub preview release, or
preprint submission (arXiv / ChemRxiv). The guiding principle: MLIP Hub must be
a trustworthy curated source. Do not publish claims that are not source-backed —
prefer `unknown` / `needs_review` / `unverified` over a guess.

> How to use: copy this list into the release issue/PR and check items off
> there, or tick them here in the release branch. Every box should be checked
> (or explicitly waived with a note) before release.

## Content accuracy

- [ ] All references verified (see `audit/references_audit_report.md`)
- [ ] No broken links (see `audit/broken_links.md`; checker run and clean)
- [ ] No unsupported benchmark claims
- [ ] No hallucinated model names
- [ ] No hallucinated dataset names
- [ ] No unsupported "foundation model" labels
- [ ] No unsupported "universal" labels
- [ ] Model metadata audit completed (`audit/model_metadata_warnings.md` clear or triaged)
- [ ] Graph edges verified (relationships are real; speculative edges marked, not asserted)
- [ ] No UI label is derived from a heuristic and presented as fact

## Verification coverage

- [ ] Every entry shown as `verified` / `partially_verified` has at least one
      `verifiedSources` entry and a `lastVerifiedDate`
- [ ] No entry is `verified` purely because it has a `paperUrl` (a link is not a check)
- [ ] Un-curated entries correctly read "Needs review" in the UI
- [ ] MACE vs MACE-MP (architecture vs foundation variant) reviewed and labelled correctly

## Paper / docs

- [ ] Overleaf comments addressed
- [ ] Latest review papers checked (see `docs/paper_revision_todos.md` once added)
- [ ] OpenKIM described as one example of community infrastructure, not the only/dominant one

## Process

- [ ] `npm run check:landscape` passes; coverage report reviewed
- [ ] `npm run export:landscape` run and `public/data` snapshots committed (CI `git diff` gate green)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] GitHub preview release completed before arXiv / ChemRxiv
- [ ] Model developer feedback pathway prepared (issue template + CONTRIBUTING guidance live)
- [ ] Beta disclaimer present (site does not overclaim perfect accuracy)
