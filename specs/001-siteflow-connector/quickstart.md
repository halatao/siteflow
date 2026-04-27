# Quickstart: Siteflow Connector

## Build and Test the Package

```bash
npm install
npm run build
npm run test
```

## Try Init in a Fixture Next.js App

```bash
npx create-next-app@latest fixture-site --ts --tailwind --app --eslint
cd fixture-site
node ../dist/cli/index.js init
```

Expected result:
- `cms.connector.json` exists.
- `content/site.json` exists.
- `content/navigation.json` exists.
- `content/pages/en/home.json` exists.
- `public/uploads` exists.
- `src/cms/content-loader.ts`, `block-registry.ts`, `style-maps.ts`, and `types.ts` exist.
- `src/components/cms/BlockRenderer.tsx` and starter block components exist.
- `package.json` contains `cms:validate` and `cms:doctor`.

## Validate Generated Content

```bash
npm run cms:validate
```

Expected result: validation passes immediately after init in an otherwise valid supported Next.js project.

## Run Readiness Diagnostics

```bash
npm run cms:doctor
```

Expected result: doctor reports repository readiness and does not modify files.

## Manual Editing Check

Edit `content/pages/en/home.json`, then rerun:

```bash
npm run cms:validate
```

Expected result: valid manual content edits pass without any external CMS service.
