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

`.github/workflows/deploy.yml` runs on `push` to `main` only: checkout with full history (`fetch-depth: 0`), `actions/setup-node` with Node 24 and npm caching, `npm ci`, `npm test`, `npm run build`, an ordering guard, then the deploy step. Steps run in order and a failed step ends the job, which gives the "failed gates publish nothing" behavior without extra logic.

A workflow-level `concurrency` group with `cancel-in-progress: false` and `queue: max` keeps two quick merges from publishing out of order. `cancel-in-progress: false` alone is not enough: GitHub keeps at most one pending run per group by default and a newer pending run replaces it, so three quick pushes would skip the middle one. `queue: max` keeps up to 100 pending runs, which GitHub starts first-in-first-out by when each began waiting ([GitHub docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)), so every push gets its own run and publishes in turn.

GitHub does not guarantee that FIFO order, so the ordering guard stops an older commit from overwriting a newer one. It lists the commit SHAs of this workflow's successful runs on `main` (`gh run list --workflow deploy.yml --branch main --status success --json headSha`, using `GITHUB_TOKEN` with `actions: read`) and, if any of them is a different commit that has `github.sha` as an ancestor (`git merge-base --is-ancestor`), it skips the deploy step and writes a `::notice::` saying which newer commit is already live. A skipped run still succeeds, because the newer published commit contains its changes. In the normal FIFO case no newer run has finished yet, so the guard never skips.

The workflow does not run `openspec validate`: it guards the page, and the loop already validates specs before anything reaches `main`.

### Project name and URL

The Pages project is `seaperch-pontoon-generator`, so the site is `seaperch-pontoon-generator.pages.dev`. The README's setup also attaches the custom domain `pontoons.pfa.name`, a one-time dashboard step because the `pfa.name` zone is already on Cloudflare. The maintainer can choose another name at setup without changing the workflow.

### One-time setup lives in the README

The maintainer, not the workflow, creates the Pages project (`npx wrangler pages project create seaperch-pontoon-generator --production-branch main`), creates the API token, adds the two repository secrets and attaches the custom domain. These need account credentials that the repository and the loop's agents do not have.

## Risks / Trade-offs

- [Cloudflare Pages rejects files over 25 MiB, and the WebAssembly file is 21.9 MiB] → The deploy step fails loudly if a dependency upgrade pushes it over; the fix then is serving the file from R2, a separate change.
- [An expired or revoked API token fails every deploy] → The failed run shows on the commit and GitHub emails the maintainer. Create the token without an expiry date, scoped to Pages only.
- [The first real deployment can only happen after merge and setup] → The loop can lint the workflow and exercise the ordering guard's shell logic against local git history, but cannot exercise Cloudflare or GitHub's queue. The maintainer checks the first deployment and overlapping pushes by hand, as the README describes.
- [More than 100 runs pending at once would cancel the overflow] → Not reachable for a repository merged to by hand; a cancelled run shows on its commit.

## Migration Plan

1. Do the README's one-time setup.
2. Merge this change. The merge commit's push to `main` triggers the first deployment.
3. Open the public URL and download a STEP file to confirm.
4. Check overlapping pushes once: push three empty commits to `main` in quick succession (`git commit --allow-empty` and `git push` three times while the first run is still going). In the Actions tab all three runs wait rather than being cancelled and each finishes successfully; the Cloudflare dashboard lists their production deployments in push order and the newest commit is live.

Rollback: delete or disable the workflow, or roll back to an earlier deployment in the Cloudflare dashboard.
