# Data Model: Siteflow Connector

## Connector Manifest

Repository root file `cms.connector.json`.

Fields:
- `version`: connector manifest version string.
- `contentDir`: path to content root, default `content`.
- `uploadsDir`: path to public uploads, default `public/uploads`.
- `locales`: supported locale codes.
- `defaultLocale`: default locale code.
- `router`: detected router mode, `app` or `pages`.
- `typescript`: detected TypeScript support.
- `tailwind`: detected Tailwind support.
- `blocks`: allowed block type names.

Validation:
- `defaultLocale` must be included in `locales`.
- `blocks` must include all built-in starter block types after init.
- Paths must be relative repository paths.

## Site Configuration

File `content/site.json`.

Fields:
- `name`: site display name.
- `defaultLocale`: default locale.
- `seo`: default SEO metadata.
- `theme`: controlled theme token.

Validation:
- Required `name`.
- SEO title and description use basic length rules.

## Navigation

File `content/navigation.json`.

Fields:
- `items`: ordered navigation items.
- item `label`, `href`, optional `locale`, optional children.

Validation:
- Labels and hrefs are required.
- Internal page links should resolve to known page slugs where practical.

## Page

Files under `content/pages/{locale}/*.json`.

Fields:
- `id`: globally unique stable page ID.
- `locale`: locale code.
- `slug`: locale-scoped route slug.
- `title`: page title.
- `seo`: page SEO metadata.
- `blocks`: ordered block list.

Validation:
- Page IDs are globally unique.
- Slugs are unique within the same locale.
- `locale` should match its folder.
- SEO title and description are required and length-checked.

## Block

Contained in page `blocks`.

Fields:
- `id`: stable block ID within the page.
- `type`: one of configured block types.
- `variant`: controlled variant token.
- `theme`: controlled theme token.
- `spacing`: controlled spacing token.
- `data`: block-specific structured content.

Validation:
- `type` must be known.
- Content must not contain arbitrary Tailwind class names.
- Image references in `data` must resolve under `public/uploads`.

## Image Asset

Files under `public/uploads`.

Fields:
- Referenced by repository-relative or public path values in content.

Validation:
- Must exist when referenced.
- Must stay inside configured uploads directory.
