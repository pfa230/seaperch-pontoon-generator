# Proposal

## Why

The pontoon generator builds to static files but has no public home, so students cannot use it without a local Node setup. Publishing it automatically on every merge to `main` keeps the public page current with no manual release step.

## What Changes

- Add a GitHub Actions workflow that, on every push to `main`, installs dependencies, runs the tests, builds the page and publishes `dist/` to Cloudflare Pages.
- Publish nothing when the tests or the build fail.
- Queue overlapping pushes so each one gets its own run, and never let an older commit overwrite a newer one: a run whose commit is already superseded by a published newer commit succeeds without publishing.
- Document in the README the one-time Cloudflare setup (Pages project, API token, repository secrets, custom domain) and the public URL.

Out of scope: preview deployments for pull requests, hosting anywhere other than Cloudflare Pages, and making the repository public.

## Capabilities

### New Capabilities

- `site-deployment`: how the page reaches its public URL: what triggers a deployment, what gates it, and what a failed gate does.

### Modified Capabilities

None.

## Impact

- New `.github/workflows/deploy.yml`.
- Two GitHub repository secrets, `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and a Cloudflare Pages project, created once by the maintainer.
- README gains a deployment section.
- The page code is unchanged.
