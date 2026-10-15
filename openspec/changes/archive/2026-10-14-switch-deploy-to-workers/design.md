# Design

## Context

See proposal.md for why. The maintainer created `seaperch-pontoon-generator` in the Cloudflare dashboard, which made an assets-only Worker at `seaperch-pontoon-generator.pfa-be5.workers.dev`, and attached the custom domain `pontoons.pfa.name` to it in the dashboard. It currently serves a placeholder page. The repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` exist and authenticate: the failed deploy reached the account and reported that no Pages project of that name exists.

## Goals / Non-Goals

**Goals:**

- Deploy to the existing Worker without recreating it or its domain.

**Non-Goals:**

- Server-side code. The Worker serves static files only.
- Simplifying the ordering guard or pinning actions to commit SHAs. The user chose to keep the workflow as merged apart from the deploy target.

## Decisions

### Decision (user): deploy to the Worker

The user chose to keep the dashboard-created Worker and change the repository, rather than delete it and create a Pages project.

### An assets-only `wrangler.jsonc`

```jsonc
{
  "name": "seaperch-pontoon-generator",
  "compatibility_date": "2026-10-01",
  "assets": { "directory": "./dist" }
}
```

With no `main` script, the Worker serves files from `dist/` only. `name` matches the existing Worker, so `wrangler deploy` uploads a new version of it rather than creating another one. The file lives at the repository root, where `wrangler-action` runs.

### The custom domain stays a dashboard setting

`wrangler.jsonc` declares no `routes`. Declaring `pontoons.pfa.name` there would make the token also need zone-level permissions to manage the domain, for a domain that is already attached. Leaving `workers_dev` at its default keeps the `workers.dev` address working.

### Workflow change

Only the deploy step's command changes, from `pages deploy dist --project-name=seaperch-pontoon-generator --branch=main` to `deploy`. Wrangler reads the Worker name and assets directory from `wrangler.jsonc`.

### Token permission

`wrangler deploy` needs the account permission "Workers Scripts: Edit". The maintainer edits the existing token to add it and may remove the Pages permissions. The secret's value stays the same, so no secret changes.

## Risks / Trade-offs

- [`wrangler deploy` might detach a custom domain that the config does not declare] → The first deployment after merge is checked at `https://pontoons.pfa.name`. If the domain is gone, re-add it in the dashboard and declare it in `wrangler.jsonc` in a follow-up change, adding the zone permission it needs.
- [Workers static assets also limit each file to 25 MiB, and the WebAssembly file is 21.9 MiB] → Same as before: the deploy fails loudly if an upgrade crosses the limit.

## Migration Plan

1. Add "Workers Scripts: Edit" to the existing API token in the Cloudflare dashboard.
2. Merge this change. Its push to `main` deploys.
3. Open `https://pontoons.pfa.name` and the `workers.dev` address and confirm both serve the generator, not the placeholder.

Rollback: in the dashboard, open the Worker's Deployments and roll back to an earlier version, or disable the workflow.
