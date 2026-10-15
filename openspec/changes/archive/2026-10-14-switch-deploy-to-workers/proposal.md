# Proposal

## Why

The deploy workflow publishes to a Cloudflare Pages project, but the project created in the Cloudflare dashboard is a Worker serving static assets (`seaperch-pontoon-generator.pfa-be5.workers.dev`), which already carries the `pontoons.pfa.name` domain. Every deploy fails with "The Pages project does not exist". Cloudflare now recommends Workers over Pages for new projects, so the repository should deploy to the Worker rather than replace it.

## What Changes

- Add `wrangler.jsonc` declaring the assets-only Worker `seaperch-pontoon-generator`, which serves `dist/`.
- Change the workflow's deploy step from `pages deploy` to `deploy`.
- Rewrite the README's deployment section for Workers: URLs, token permission, setup and rollback.

Everything else in the workflow is unchanged: the trigger, the test and build gate, the concurrency queue and the ordering guard.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-deployment`: the publish target changes from a Cloudflare Pages site to a Cloudflare Worker serving static assets.

## Impact

- New `wrangler.jsonc`; changed `.github/workflows/deploy.yml` and README.md.
- The existing `CLOUDFLARE_API_TOKEN` secret needs the account permission "Workers Scripts: Edit". The maintainer edits the token once.
- The page code is unchanged.
