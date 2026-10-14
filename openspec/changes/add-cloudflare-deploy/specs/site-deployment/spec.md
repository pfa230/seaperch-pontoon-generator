# Spec Delta

## Purpose

Defines how the pontoon generator page reaches its public URL: every change merged to `main` that passes the tests and build is published automatically, and nothing else is.

## ADDED Requirements

### Requirement: Publish on push to main
Every push to `main` SHALL start a deployment that installs dependencies from the lockfile, runs the test suite, builds the page and publishes the build output as the production version of the Cloudflare Pages site.

#### Scenario: Merged change goes live
- **WHEN** a pull request is merged into `main` and its tests and build pass
- **THEN** the public URL serves the page built from that commit

### Requirement: Failed gates publish nothing
A deployment SHALL publish nothing when installing, testing or building fails, and SHALL leave the previously published version in place. The failure SHALL be visible as a failed workflow run on the commit.

#### Scenario: Failing test blocks the deploy
- **WHEN** a commit pushed to `main` fails `npm test`
- **THEN** the deployment run fails before publishing, and the public URL keeps serving the previous version

### Requirement: Only main deploys
Pushes to branches other than `main` and pull request events SHALL NOT publish to the site.

#### Scenario: Branch push
- **WHEN** a commit is pushed to `loop/some-change`
- **THEN** no deployment runs and the public URL is unchanged
