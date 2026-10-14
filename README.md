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

`dist/` is plain static files: copy it to any static web host. Open it through a web server rather than from the file system, because the page loads its CAD kernel in a Web Worker. The mount length is a build setting in `src/settings.ts`.

## Development

Changes go through OpenSpec and [openspec-loop](https://github.com/pfa230/openspec-loop): propose with `/opsx:propose` or `/openspec-scope`, then run `loop run <change>`. Loop settings are in `openspec/loop.yaml`.
