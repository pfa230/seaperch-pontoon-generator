# Tasks

## 1. Workflow

- [ ] 1.1 Add `.github/workflows/deploy.yml` as described in design.md: trigger on push to `main` only, a non-cancelling concurrency group, Node 24 with npm caching, `npm ci`, `npm test`, `npm run build`, then `cloudflare/wrangler-action` running `pages deploy dist --project-name=seaperch-pontoon-generator --branch=main` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from secrets; verify with `npx --yes @action-validator/cli .github/workflows/deploy.yml` (or `actionlint` if available) that the file is valid, and by reading it that no step publishes before the test and build steps and that no `pull_request` or other-branch trigger exists

## 2. Documentation

- [ ] 2.1 Add a "Deployment" section to README.md with the public URL (`https://pontoons.pfa.name`, falling back to `https://seaperch-pontoon-generator.pages.dev`), the one-time setup from design.md (Pages project creation command, Pages-edit API token with no expiry, the two repository secrets via `gh secret set`, custom domain), and how to check the first deployment and roll back; verify the commands in it match the workflow's project name and secret names
