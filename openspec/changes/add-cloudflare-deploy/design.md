# Design

## Context

`npm run build` writes a static site to `dist/`: an HTML page, two small scripts, a stylesheet and a 21.9 MiB OpenCascade WebAssembly file. The repository is private on GitHub. The maintainer already uses Cloudflare for the `pfa.name` DNS zone. The home network's reverse proxies serve only `*.home.pfa.name` and are not reachable from the internet.

## Goals / Non-Goals

**Goals:**

- Zero routine upkeep: after a one-time setup, merging to `main` is the whole release process.
- The workflow repeats the repository's own checks before publishing.

**Non-Goals:**

- Pull request previews, staging environments, rollback tooling. Cloudflare's dashboard can already roll back to any earlier deployment.
- Automating the one-time Cloudflare setup.

## Decisions

### Cloudflare Pages, deployed by direct upload from GitHub Actions

Decision (user): host on Cloudflare Pages. A workflow runs `wrangler pages deploy dist` via `cloudflare/wrangler-action`, authenticated with an API token scoped to Cloudflare Pages edit and the account ID, both stored as repository secrets.

Alternatives: Cloudflare's own Git integration builds inside Cloudflare, so the test gate would live in Cloudflare build settings instead of the repository, and it needs dashboard access to change. GitHub Pages needs a public repository or a paid plan. Serving from the home server needs a public edge that does not exist.

### One workflow, one job

`.github/workflows/deploy.yml` runs on `push` to `main` only: checkout, `actions/setup-node` with Node 24 and npm caching, `npm ci`, `npm test`, `npm run build`, then the deploy step. Steps run in order and a failed step ends the job, which gives the "failed gates publish nothing" behavior without extra logic. A `concurrency` group with `cancel-in-progress: false` keeps two quick merges from publishing out of order.

The workflow does not run `openspec validate`: it guards the page, and the loop already validates specs before anything reaches `main`.

### Project name and URL

The Pages project is `seaperch-pontoon-generator`, so the site is `seaperch-pontoon-generator.pages.dev`. The README's setup also attaches the custom domain `pontoons.pfa.name`, a one-time dashboard step because the `pfa.name` zone is already on Cloudflare. The maintainer can choose another name at setup without changing the workflow.

### One-time setup lives in the README

The maintainer, not the workflow, creates the Pages project (`npx wrangler pages project create seaperch-pontoon-generator --production-branch main`), creates the API token, adds the two repository secrets and attaches the custom domain. These need account credentials that the repository and the loop's agents do not have.

## Risks / Trade-offs

- [Cloudflare Pages rejects files over 25 MiB, and the WebAssembly file is 21.9 MiB] → The deploy step fails loudly if a dependency upgrade pushes it over; the fix then is serving the file from R2, a separate change.
- [An expired or revoked API token fails every deploy] → The failed run shows on the commit and GitHub emails the maintainer. Create the token without an expiry date, scoped to Pages only.
- [The first real deployment can only happen after merge and setup] → The loop can lint the workflow but cannot exercise Cloudflare. The maintainer checks the first deployment by hand, as the README describes.

## Migration Plan

1. Do the README's one-time setup.
2. Merge this change. The merge commit's push to `main` triggers the first deployment.
3. Open the public URL and download a STEP file to confirm.

Rollback: delete or disable the workflow, or roll back to an earlier deployment in the Cloudflare dashboard.
