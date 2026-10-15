# Spec Delta

## MODIFIED Requirements

### Requirement: Publish on push to main
Every push to `main` SHALL start a deployment that installs dependencies from the lockfile, runs the test suite, builds the page and publishes the build output as the production version of the Cloudflare Worker that serves the site's static assets.

#### Scenario: Merged change goes live
- **WHEN** a pull request is merged into `main` and its tests and build pass
- **THEN** the public URL serves the page built from that commit

#### Scenario: Quick successive merges
- **WHEN** three commits are pushed to `main` while an earlier deployment is still running
- **THEN** each commit gets its own deployment and none is cancelled or replaced
- **AND** each deployment either publishes or, when a newer commit has already published, succeeds without publishing
- **AND** no deployment publishes an older commit after a newer one, and the public URL ends up serving the newest commit
