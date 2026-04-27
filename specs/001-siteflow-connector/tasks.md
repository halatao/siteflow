# Tasks: Siteflow Connector

**Input**: Design documents from `/specs/001-siteflow-connector/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/cli.md](./contracts/cli.md), [quickstart.md](./quickstart.md)

**Tests**: Unit and smoke tests are required by the implementation plan and acceptance criteria.

**Organization**: Tasks are dependency-ordered and grouped by setup, shared foundation, user story delivery, and polish. US1 remains the highest product priority, but validation is implemented before init because init templates must target a stable schema and validation contract.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks after dependencies are met
- **[Story]**: Maps task to the user story it primarily enables
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the package skeleton and build/test configuration.

- [X] T001 Create project scaffolding directories in `src/cli/commands/`, `src/schemas/`, `src/validators/`, `src/next/`, `src/templates/`, `src/utils/`, `tests/unit/`, `tests/smoke/`, `tests/fixtures/valid-next-app/`, `tests/fixtures/invalid-duplicate-slug/`, `tests/fixtures/invalid-missing-image/`, and `tests/fixtures/invalid-unknown-block/`
- [X] T002 Add ESM TypeScript package/build/test configuration in `package.json`, `tsconfig.json`, `tsup.config.ts`, and `vitest.config.ts`
- [X] T003 Implement commander CLI entry point with `init`, `validate`, and `doctor` command registration plus init option parsing for `--locale`, `--locales`, `--dry-run`, and reserved future `--force` support in `src/cli/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities, schemas, fixtures, and reusable validation core required by CLI commands, tests, and future CMS integration.

**CRITICAL**: No command implementation should begin until this phase is complete.

- [X] T004 [P] Add shared logger and filesystem/project helpers, including non-destructive writes and package manager detection from `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, and `bun.lockb`, in `src/utils/logger.ts`, `src/utils/fs.ts`, and `src/utils/project.ts`
- [X] T005 [P] Add Zod schemas for manifest, page, site, navigation, and sections in `src/schemas/index.ts`
- [X] T006 [P] Add reusable test fixture repositories/files in `tests/fixtures/valid-next-app/`, `tests/fixtures/invalid-duplicate-slug/`, `tests/fixtures/invalid-missing-image/`, and `tests/fixtures/invalid-unknown-block/`
- [X] T007 Implement reusable project validation core for config parsing, recursive page validation, duplicate IDs/slugs, unknown blocks, missing images, navigation checks, SEO checks, and structured results in `src/validators/validate-project.ts`

**Checkpoint**: Foundation ready; validate CLI, doctor, tests, and future CMS integration can reuse the same validation behavior.

---

## Phase 3: User Story 2 - Validate repository content for CMS readiness (Priority: P2)

**Goal**: Developers can validate repository-managed content and receive actionable pass/fail feedback.

**Independent Test**: Run `siteflow validate` against valid and invalid fixtures; valid initialized content passes, while duplicates, unknown blocks, missing images, malformed JSON, and SEO issues fail with file-level messages.

### Implementation for User Story 2

- [X] T008 [US2] Implement thin `validate` command wrapper around `src/validators/validate-project.ts` with CLI output and exit codes in `src/cli/commands/validate.ts`
- [X] T009 [P] [US2] Add unit tests for schemas in `tests/unit/schemas.test.ts`
- [X] T010 [P] [US2] Add unit tests for duplicate slug validation using fixtures and `src/validators/validate-project.ts` in `tests/unit/validate-duplicates.test.ts`

**Checkpoint**: Content validation can run independently and the validation core is tested before init templates depend on it.

---

## Phase 4: User Story 1 - Initialize a CMS-ready website repository (Priority: P1) MVP

**Goal**: Developers can initialize a clean Next.js repository into a CMS-ready static website repository.

**Independent Test**: Run `siteflow init` in a clean supported Next.js fixture and verify all generated files/directories exist, existing files are skipped instead of overwritten, generated validation passes, and no external CMS is required.

### Implementation for User Story 1

- [X] T011 [US1] Implement non-destructive `init` command with project detection, `--locale cs`, `--locales cs,en`, `--dry-run`, reserved future `--force` option handling, lockfile-based package manager detection, package script updates, `public/uploads` creation, template writing, skip-existing-file behavior, and created/skipped/warnings summary output in `src/cli/commands/init.ts`
- [X] T012 [P] [US1] Add generated Next.js content loader template in `src/templates/src/cms/content-loader.ts`
- [X] T013 [P] [US1] Add generated `BlockRenderer` and base block templates in `src/templates/src/components/cms/BlockRenderer.tsx`, `src/templates/src/components/cms/HeroBlock.tsx`, `src/templates/src/components/cms/TextBlock.tsx`, `src/templates/src/components/cms/TextImageBlock.tsx`, `src/templates/src/components/cms/FeaturesBlock.tsx`, `src/templates/src/components/cms/FaqBlock.tsx`, and `src/templates/src/components/cms/CtaBlock.tsx`
- [X] T014 [P] [US1] Add generated Tailwind style maps template in `src/templates/src/cms/style-maps.ts`
- [X] T015 [US1] Add smoke test for init output, non-overwrite behavior, generated scripts, and validation-ready starter content in `tests/smoke/init-output.test.ts`

**Checkpoint**: Initialization creates a complete, editable, CMS-ready file structure that targets the stable validation contract.

---

## Phase 5: User Story 3 - Diagnose readiness for external CMS management (Priority: P3)

**Goal**: Developers can inspect repository readiness without modifying files.

**Independent Test**: Run `siteflow doctor` in ready and partially configured fixture repositories and verify output plus unchanged file state.

### Implementation for User Story 3

- [X] T016 [US3] Implement read-only `doctor` command using `src/validators/validate-project.ts` for validation readiness plus Next.js, router, TypeScript, Tailwind, connector files, scripts, and remediation checks in `src/cli/commands/doctor.ts`

**Checkpoint**: Diagnostics are available, reuse validation behavior, and remain side-effect free.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Package exports, documentation, and final acceptance checks.

- [X] T017 Add package exports for CLI, schemas, types, validators, validation core, and optional Next.js helpers in `src/index.ts`, `src/next/index.ts`, and `package.json`
- [X] T018 Add README with GitHub install instructions, CLI usage, init options, generated file contract, validation/doctor behavior, and no-CMS/no-remote-runtime guarantees in `README.md`

**Checkpoint**: Package is documented and acceptance checks can be run.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: no dependencies.
- **Phase 2 Foundational**: depends on Phase 1 and blocks all command implementation.
- **US2 Validate**: depends on Phase 2 and establishes the stable schema/validation contract.
- **US1 Init**: depends on Phase 2 and should follow US2 validation implementation so generated templates can validate immediately.
- **US3 Doctor**: depends on Phase 2 and should run after the validation core exists so doctor can reuse validation readiness checks.
- **Polish**: depends on command/template implementation and public API shape.

### User Story Dependencies

- **US1 (P1)**: highest product priority; functionally depends on foundation and template files, and final verification depends on validation.
- **US2 (P2)**: implemented first in practice after foundation because validation provides the reusable contract needed by init templates, doctor, tests, and future CMS integration.
- **US3 (P3)**: depends on foundation and the reusable validation core; remains independently testable through read-only readiness checks.

### Priority vs Implementation Order

Although US1 is the highest product priority, validation is implemented first because init templates must target a stable schema and validation contract.

### Practical Implementation Order

The implementation order is T001 through T018:
setup; package/config files; CLI entry point; shared helpers/schemas/fixtures; validation core; validate CLI wrapper; validation tests; init; templates; init smoke test; doctor; exports; README.

---

## Parallel Opportunities

- T004, T005, and T006 can run in parallel after T003 because they touch separate helper, schema, and fixture paths.
- T009 and T010 can run in parallel after T007 because they test different validation surfaces.
- T012, T013, and T014 can run in parallel after T011 defines template-copy expectations.

---

## Implementation Strategy

### MVP First

1. Complete T001-T007 to establish package structure, CLI registration, helpers, schemas, fixtures, and reusable validation core.
2. Complete T008-T010 so validation behavior is stable and tested before init templates depend on it.
3. Complete T011-T015 to deliver non-destructive initialization, generated website files, and init smoke coverage.
4. Complete T016-T018 for doctor, exports, and documentation.
5. Run the final validation commands.

### Final Validation

Run these checks before considering implementation complete:

```bash
npm run build
npm run test
node dist/cli/index.js init
node dist/cli/index.js validate
node dist/cli/index.js doctor
```

---

## Notes

- Keep generated files readable and editable.
- Do not introduce a web server, CMS UI, remote API, or runtime CMS dependency.
- Do not include gallery block, contact form block, custom block schema builder, visual drag and drop builder, Lovable import, existing repo auto-migration, drafts, remote API, CMS UI, or runtime CMS dependency in this iteration.
- `init` must skip existing files instead of overwriting them.
- `siteflow init --dry-run` must report intended created/skipped/warning actions without modifying files.
- `siteflow init --locale cs` and `siteflow init --locales cs,en` must be supported or explicitly reserved in the CLI contract; `--force` may be reserved for future support but force overwrite behavior is not part of the MVP.
- Content must not store arbitrary Tailwind class names.
