# Feature Specification: Siteflow Connector

**Feature Branch**: `001-siteflow-connector`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "Build an npm package named @siteflow/connector. The package turns a website repository into a CMS-ready static website repository. It must allow a future external CMS to manage website content through repository file changes without creating vendor lock-in. The website must run and build without the CMS; content lives as JSON files in the repository; images live under public uploads; website components own layout and styling; CMS content stores only data, variants, themes, spacing, search metadata, and page structure. Required user-facing commands are init, validate, and doctor."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize a CMS-ready website repository (Priority: P1)

A website developer can run the connector in an existing website repository and receive a complete, editable content structure plus rendering helpers that make the site ready for future external CMS management while still working without that CMS.

**Why this priority**: Initialization is the minimum useful outcome. Without a generated structure, there is no standard content contract for developers or future CMS tools to manage.

**Independent Test**: Can be fully tested by running initialization in a clean, otherwise valid website project and confirming that the generated content, upload directory, helper files, starter blocks, and package scripts are present and usable without connecting any external CMS.

**Acceptance Scenarios**:

1. **Given** an otherwise valid website project with no connector files, **When** the developer runs `init`, **Then** the repository contains connector configuration, site content, navigation content, a localized home page, upload storage, content-loading helpers, block-rendering helpers, style maps, shared content types, and starter content blocks.
2. **Given** a project that already has some compatible directories or files, **When** the developer runs initialization, **Then** missing required assets are added and existing developer-owned files are not overwritten without a clear warning or safe handling.
3. **Given** a website project after initialization, **When** no external CMS is installed or configured, **Then** the website can still be edited manually through repository files and can build if the underlying website project is otherwise valid.

---

### User Story 2 - Validate repository content for CMS readiness (Priority: P2)

A developer can validate all repository-managed content and receive clear pass/fail feedback before content changes are merged or deployed.

**Why this priority**: External CMS management through file changes requires a reliable contract. Validation prevents broken pages, missing media, duplicate routes, and unsafe content structures from entering the repository.

**Independent Test**: Can be fully tested by running validation against initialized content, then introducing representative invalid content and confirming that each issue is detected with an actionable message.

**Acceptance Scenarios**:

1. **Given** an initialized repository with valid starter content, **When** the developer runs `validate`, **Then** validation passes with no blocking errors.
2. **Given** page content with duplicate page identifiers or duplicate localized slugs, **When** validation runs, **Then** it reports each duplicate and identifies the affected content files.
3. **Given** page content that references an unknown block type or a missing uploaded image, **When** validation runs, **Then** it reports the invalid block or missing asset with the affected file path.
4. **Given** page content with missing or weak required search metadata, **When** validation runs, **Then** it reports the search metadata issue and explains how to correct it.

---

### User Story 3 - Diagnose readiness for external CMS management (Priority: P3)

A developer can run a diagnostic command that inspects repository readiness for external CMS management and prints actionable recommendations without changing files.

**Why this priority**: Diagnostics help teams adopt the connector safely and confirm repository health over time, but they depend on the initialization and validation contract being defined first.

**Independent Test**: Can be fully tested by running diagnostics in ready and partially configured repositories and confirming that the command never modifies files while reporting clear next actions.

**Acceptance Scenarios**:

1. **Given** a fully initialized and valid repository, **When** the developer runs `doctor`, **Then** the report shows readiness checks as passing and identifies no required corrective action.
2. **Given** a repository missing connector configuration, content directories, upload storage, rendering helpers, or validation scripts, **When** diagnostics run, **Then** the report lists each missing readiness item with a recommended corrective action.
3. **Given** any repository state, **When** diagnostics run, **Then** no repository files are created, modified, or deleted.

---

### Edge Cases

- Initialization is run outside a supported website repository.
- Initialization is run in a supported website repository that does not use typed source files.
- Initialization is run in a project without a detected styling setup.
- The repository uses either app-based or page-based routing conventions.
- Content files contain malformed JSON.
- Page content contains duplicate slugs within the same locale but valid duplicate slugs across different locales.
- Page content contains duplicate page IDs across locales or directories.
- Content references an image path outside the allowed upload location.
- Navigation references pages or paths that are missing or invalid.
- Starter content is manually edited without any external CMS present.
- Diagnostics are run on a dirty working tree or partially initialized repository.
- The repository has no existing uploaded images when starter content is created.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The connector MUST be distributed under the package identity `@siteflow/connector`.
- **FR-002**: The connector MUST expose a command-line entry point named `siteflow` with `init`, `validate`, and `doctor` commands.
- **FR-003**: The `init` command MUST detect whether the current repository is a supported website project before creating connector assets.
- **FR-004**: The `init` command MUST detect whether the repository uses app-based routing or page-based routing and record or use that information so generated helpers align with the project layout.
- **FR-005**: The `init` command MUST detect whether the project uses typed source files and supported styling conventions required by the generated helpers, and MUST report missing prerequisites clearly.
- **FR-006**: The `init` command MUST create `cms.connector.json` at the repository root when it is missing.
- **FR-007**: The `init` command MUST create `content/site.json`, `content/navigation.json`, and `content/pages/{locale}/home.json` when missing.
- **FR-008**: The `init` command MUST create `public/uploads` when missing.
- **FR-009**: The `init` command MUST create reusable website helper files at `src/cms/content-loader.ts`, `src/cms/block-registry.ts`, `src/cms/style-maps.ts`, `src/cms/types.ts`, and `src/components/cms/BlockRenderer.tsx` when missing.
- **FR-010**: The `init` command MUST create starter block component files for hero, text, text-with-image, features, frequently asked questions, and call-to-action content blocks when missing.
- **FR-011**: The `init` command MUST add convenient repository scripts for content validation and diagnostics when missing.
- **FR-012**: The initialized website structure MUST remain usable when edited manually through repository files and MUST NOT require any external CMS service at runtime or build time.
- **FR-013**: Repository content MUST store structured data, visual variants, themes, spacing choices, search metadata, and page structure.
- **FR-014**: Repository content MUST NOT store arbitrary styling class names or layout implementation details controlled by website components.
- **FR-015**: The `validate` command MUST read connector configuration, site content, navigation content, and all page content recursively.
- **FR-016**: The `validate` command MUST validate page content, site configuration, and navigation content against documented schemas.
- **FR-017**: The `validate` command MUST detect duplicate localized slugs within the same locale.
- **FR-018**: The `validate` command MUST detect duplicate page identifiers across all page content.
- **FR-019**: The `validate` command MUST detect page blocks whose type is not present in the configured block registry.
- **FR-020**: The `validate` command MUST detect content image references that do not resolve to files in the allowed upload storage location.
- **FR-021**: The `validate` command MUST enforce basic search metadata rules for pages, including presence and reasonable length of required fields.
- **FR-022**: Validation failures MUST identify the affected file and field or content item whenever possible.
- **FR-023**: The `doctor` command MUST check repository readiness for external CMS management without modifying files.
- **FR-024**: Diagnostics output MUST distinguish passing checks, warnings, and blocking issues, and MUST include actionable remediation guidance.
- **FR-025**: The connector MUST publish schemas and shared content types so website code and external tooling can rely on the same content contract.
- **FR-026**: The connector MUST support future external CMS operation through repository file changes rather than proprietary runtime dependencies.
- **FR-027**: After initialization, the repository MUST provide user-facing scripts named `cms:validate` and `cms:doctor`.
- **FR-028**: The generated starter content MUST validate successfully immediately after initialization when the underlying website project is otherwise valid.
- **FR-029**: The initialized website MUST remain buildable when the underlying website project is otherwise valid.

### Key Entities

- **Connector Configuration**: Repository-level settings that describe connector version, content locations, supported locales, routing convention, and block registry expectations.
- **Site Configuration**: Global website data such as site identity, default locale, default search metadata, and global presentation options.
- **Navigation**: Structured menus and links used by the website, including labels, targets, ordering, and locale-specific values when applicable.
- **Page**: A repository-managed content document with an ID, locale, slug, title, search metadata, and ordered page sections.
- **Block**: A typed page section containing data, variant, theme, and spacing values that website components render using controlled layouts and styling.
- **Image Asset**: A public upload file referenced by content and stored in the repository's allowed upload storage location.
- **Readiness Report**: Diagnostic output describing whether the repository can be safely managed by an external CMS through file changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can initialize a clean, otherwise valid website project in under 2 minutes and receive all required connector files and directories.
- **SC-002**: Starter content generated by initialization validates successfully on the first run in 100% of clean supported projects.
- **SC-003**: Validation detects duplicate page IDs, duplicate localized slugs, unknown block types, missing image assets, malformed content, and basic search metadata issues with file-level feedback in 100% of representative invalid fixtures.
- **SC-004**: Diagnostics complete without modifying repository files in 100% of tested repository states.
- **SC-005**: A website initialized by the connector can be built and manually content-edited without any external CMS dependency when the underlying website project is otherwise valid.
- **SC-006**: Generated content contains no arbitrary styling class names in 100% of starter content files.
- **SC-007**: A developer can run the generated validation script immediately after initialization and receive a passing result in 100% of clean supported projects.

## Assumptions

- The first release targets a single website repository at a time and is run from the repository root.
- English starter content is acceptable for the default localized home page unless the project already declares another default locale.
- Initialization may warn about missing recommended project capabilities, but it should avoid destructive changes and preserve existing compatible files.
- User-provided implementation preferences such as typed implementation, validation library, command framework, build tool, and test runner will be handled during planning and task generation.
- Page slug uniqueness is required within a locale; identical slugs in different locales are allowed.
- Page IDs are globally unique across locales to support stable CMS references and cross-locale relationships.
- Basic search metadata rules include required title and description fields with sensible length limits.
- External CMS authentication, hosted CMS UI, webhook processing, and media upload services are outside this feature's scope.
