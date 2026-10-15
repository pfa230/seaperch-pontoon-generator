# Tasks

## 1. Worker deploy

- [x] 1.1 Add `wrangler.jsonc` at the repository root with the content in design.md; verify the Worker name `seaperch-pontoon-generator` directly in `wrangler.jsonc`, and verify `WRANGLER_LOG=debug npx --yes wrangler@4 deploy --dry-run` (run after `npm run build`) reads it and lists the files in `dist/` as assets without contacting Cloudflare
- [x] 1.2 Change the deploy step in `.github/workflows/deploy.yml` to the command `deploy`, leaving every other step unchanged; verify with `git diff` that only that line changed and that the workflow still passes the validator used in the previous change

## 2. Documentation

- [x] 2.1 Rewrite the Deployment section of README.md for the Worker: public URLs `https://pontoons.pfa.name` and `https://seaperch-pontoon-generator.pfa-be5.workers.dev`, the token permission "Workers Scripts: Edit", setup without `wrangler login` (export the token and account ID, or use the dashboard), the custom domain as a dashboard setting, and rollback through the Worker's Deployments; verify no `pages deploy`, `pages project` or `pages.dev` reference remains with `rg -n 'pages (deploy|project)|pages\.dev' README.md`
