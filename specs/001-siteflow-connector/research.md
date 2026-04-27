# Research: Siteflow Connector

## Decision: ESM TypeScript CLI package

**Rationale**: ESM-compatible TypeScript matches the requested package direction and works for GitHub-hosted installation with modern Node.js. The CLI can build to `dist` with declarations and a `siteflow` binary without introducing a runtime service.

**Alternatives considered**: CommonJS was rejected because the request explicitly asks for ESM-compatible TypeScript. A framework-based app was rejected because the feature is CLI-first and must not introduce a web server or CMS UI.

## Decision: Commander for command registration

**Rationale**: `commander` keeps `src/cli/index.ts` small and explicit while providing stable subcommand registration for `init`, `validate`, and `doctor`.

**Alternatives considered**: Hand-rolled argument parsing was rejected as more error-prone. Larger CLI frameworks were rejected as unnecessary for three commands.

## Decision: Zod schemas as the shared content contract

**Rationale**: Zod provides runtime validation and inferred TypeScript types from one source. This supports the CLI, optional Next.js helpers, tests, and future external tooling without a proprietary runtime.

**Alternatives considered**: JSON Schema alone was rejected for v1 because the package needs TypeScript-first validation and types. Custom validators were rejected as harder to maintain.

## Decision: Plain file templates for generated website files

**Rationale**: Templates under `src/templates` make generated output inspectable, editable, and independent of any CMS. `init` copies missing files and skips existing files to avoid destructive changes.

**Alternatives considered**: Runtime code generation was rejected because generated files must be plain project files. Remote template fetching was rejected because the connector must not require a remote API.

## Decision: Repository-local validation with no network access

**Rationale**: `validate` reads `cms.connector.json`, `content/**/*.json`, and `public/uploads` only. This preserves offline behavior and makes CI/GitHub workflows simple.

**Alternatives considered**: CMS API validation was rejected because external CMS integration is out of scope and would create vendor coupling.

## Decision: Read-only doctor checks

**Rationale**: `doctor` reports readiness without side effects, which makes it safe for diagnostics in partially configured repositories and CI.

**Alternatives considered**: Auto-repair behavior was rejected for `doctor`; remediation belongs in `init` or a future explicit command.
