# SeaPerch Pontoon Generator

A web page that generates 3D-printable pontoons for SeaPerch ROVs, sized to trim a measured ROV to neutral buoyancy.

## Running

The page needs Node.js 22.12 or later to build. It then runs entirely in the browser.

```sh
npm ci          # install dependencies
npm run dev     # serve the page at http://localhost:5173 while editing
npm test        # run the unit and model tests
npm run build   # write the static page to dist/
npm run preview # serve dist/ at http://localhost:4173
```

`dist/` is plain static files: copy it to any static web host. Open it through a web server rather than from the file system, because the page loads its CAD kernel in a Web Worker. The mount length, fit clearance, screw hole diameter and screw hole position are build settings in `src/settings.ts`.

## Deployment

The page is live at https://pontoons.pfa.name (also https://seaperch-pontoon-generator.pfa-be5.workers.dev). Every push to `main` runs `.github/workflows/deploy.yml`, which installs dependencies, runs the tests, builds the page and publishes `dist/` to the Cloudflare Worker `seaperch-pontoon-generator`. `wrangler.jsonc` declares the Worker's name and serves `dist/` as static assets, with no server-side script. A failed install, test or build publishes nothing and shows as a failed run on the commit. Overlapping pushes queue rather than cancel each other, and a run whose commit is already contained in a newer published commit succeeds without publishing, logging a notice that names the newer commit.

### One-time setup

None of these steps needs `npx wrangler login`.

1. In the Cloudflare dashboard, under My Profile > API Tokens, create a custom token with the account permission Workers Scripts: Edit, limited to your account, with no expiry date.
2. Add the two repository secrets, pasting the token and the account ID (shown on the dashboard's Workers & Pages overview) when prompted:

   ```sh
   gh secret set CLOUDFLARE_API_TOKEN
   gh secret set CLOUDFLARE_ACCOUNT_ID
   ```

3. Create the Worker, either in the dashboard under Workers & Pages > Create with the name `seaperch-pontoon-generator`, or from a shell with the token and account ID exported:

   ```sh
   export CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=...
   npm run build
   npx wrangler deploy
   ```

4. In the dashboard, open Workers & Pages > `seaperch-pontoon-generator` > Settings > Domains & Routes and add the custom domain `pontoons.pfa.name`. The domain is a dashboard setting only: `wrangler.jsonc` declares no routes, so the token needs no zone permissions.

### Checking a deployment

After the first merge to `main`, open the Deploy run in the repository's Actions tab and confirm it succeeds, then open https://pontoons.pfa.name and download a STEP file.

Check overlapping pushes once: while a Deploy run is still going, push three empty commits to `main` in quick succession (`git commit --allow-empty -m "test deploy queue"` then `git push`, three times). In the Actions tab all three runs wait rather than being cancelled, and each finishes successfully, either publishing or logging a notice that names the newer commit already live. The runs that publish do so in commit order, and the newest commit is live.

### Rolling back

In the dashboard, open Workers & Pages > `seaperch-pontoon-generator` > Deployments and roll back to an earlier version. To stop deploying altogether, disable the Deploy workflow in the Actions tab (`gh workflow disable deploy.yml`) or delete it.

## Development

Changes go through OpenSpec and [openspec-loop](https://github.com/pfa230/openspec-loop): propose with `/opsx:propose` or `/openspec-scope`, then run `loop run <change>`. Loop settings are in `openspec/loop.yaml`.
