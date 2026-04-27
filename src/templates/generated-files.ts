export type TemplateFile = {
  path: string;
  content: string;
};

const blockTypes = ["hero", "text", "textImage", "features", "faq", "cta"] as const;

export function buildGeneratedFiles(locales: string[], defaultLocale: string): TemplateFile[] {
  return [
    { path: "cms.connector.json", content: manifestTemplate(locales, defaultLocale) },
    { path: "content/site.json", content: siteTemplate(defaultLocale) },
    { path: "content/navigation.json", content: navigationTemplate(defaultLocale) },
    ...locales.map((locale) => ({
      path: `content/pages/${locale}/home.json`,
      content: homePageTemplate(locale),
    })),
    { path: "src/cms/content-loader.ts", content: contentLoaderTemplate },
    { path: "src/cms/style-maps.ts", content: styleMapsTemplate },
    { path: "src/cms/block-registry.ts", content: blockRegistryTemplate },
    { path: "src/cms/types.ts", content: typesTemplate },
    { path: "src/components/cms/BlockRenderer.tsx", content: blockRendererTemplate },
    { path: "src/components/cms/HeroBlock.tsx", content: heroBlockTemplate },
    { path: "src/components/cms/TextBlock.tsx", content: textBlockTemplate },
    { path: "src/components/cms/TextImageBlock.tsx", content: textImageBlockTemplate },
    { path: "src/components/cms/FeaturesBlock.tsx", content: featuresBlockTemplate },
    { path: "src/components/cms/FaqBlock.tsx", content: faqBlockTemplate },
    { path: "src/components/cms/CtaBlock.tsx", content: ctaBlockTemplate },
  ];
}

function manifestTemplate(locales: string[], defaultLocale: string): string {
  return jsonTemplate({
    version: 1,
    project: {
      name: "Siteflow Website",
      framework: "nextjs",
      router: "app",
      language: "typescript",
      styling: "tailwind",
    },
    content: {
      root: "content",
      pages: "pages",
      site: "site.json",
      navigation: "navigation.json",
      assets: "public/uploads",
    },
    localization: {
      enabled: locales.length > 1,
      defaultLocale,
      locales,
    },
    build: {
      validateCommand: "siteflow validate",
    },
    publishing: {
      provider: "github",
      mode: "pull-request",
    },
    features: {},
    editable: {
      files: ["content/**/*.json", "public/uploads/**/*"],
    },
    blocks: Object.fromEntries(blockTypes.map((type) => [type, {}])),
  });
}

function siteTemplate(defaultLocale: string): string {
  return jsonTemplate({
    name: "Siteflow Website",
    defaultLocale,
    seo: {
      title: "Siteflow Website",
      description: "A CMS-ready static website powered by repository content.",
      indexable: true,
    },
    theme: "light",
  });
}

function navigationTemplate(defaultLocale: string): string {
  return jsonTemplate({
    items: [
      {
        label: "Home",
        href: "/",
        locale: defaultLocale,
      },
    ],
  });
}

function homePageTemplate(locale: string): string {
  return jsonTemplate({
    id: `home-${locale}`,
    locale,
    slug: "/",
    title: "Home",
    seo: {
      title: "Home",
      description: "A CMS-ready home page that can be edited through repository JSON.",
      indexable: true,
    },
    sections: [
      {
        id: "hero",
        type: "hero",
        variant: "default",
        theme: "light",
        spacing: "lg",
        props: {
          eyebrow: "Siteflow",
          heading: "CMS-ready content without lock-in",
          body: "Edit this page by changing JSON files in the repository.",
          ctaLabel: "Get started",
          ctaHref: "/",
        },
      },
      {
        id: "intro",
        type: "text",
        variant: "default",
        theme: "muted",
        spacing: "md",
        props: {
          heading: "Repository-owned content",
          body: "Components own layout and styling. Content stores only structured data and safe presentation tokens.",
        },
      },
    ],
  });
}

function jsonTemplate(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const typesTemplate = `export type CmsTheme = "light" | "muted" | "dark" | "accent";
export type CmsSpacing = "sm" | "md" | "lg";

export type CmsBlock = {
  id: string;
  type: string;
  variant?: string;
  theme?: CmsTheme;
  spacing?: CmsSpacing;
  props: Record<string, unknown>;
};

export type CmsPage = {
  id: string;
  locale: string;
  slug: string;
  title: string;
  seo: {
    title: string;
    description: string;
    image?: string;
    indexable: boolean;
  };
  sections: CmsBlock[];
};
`;

const contentLoaderTemplate = `import fs from "node:fs";
import path from "node:path";
import type { CmsPage } from "./types";

const contentRoot = path.join(process.cwd(), "content");

export function loadPage(locale: string, slug = "/"): CmsPage | undefined {
  const pagesDir = path.join(contentRoot, "pages", locale);
  if (!fs.existsSync(pagesDir)) return undefined;

  for (const fileName of fs.readdirSync(pagesDir)) {
    if (!fileName.endsWith(".json")) continue;
    const page = JSON.parse(fs.readFileSync(path.join(pagesDir, fileName), "utf8")) as CmsPage;
    if (page.slug === slug) return page;
  }

  return undefined;
}

export function loadSiteConfig<T = unknown>(): T {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, "site.json"), "utf8")) as T;
}

export function loadNavigation<T = unknown>(): T {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, "navigation.json"), "utf8")) as T;
}
`;

const styleMapsTemplate = `export const themeClassMap = {
  light: "bg-white text-slate-950",
  muted: "bg-slate-50 text-slate-950",
  dark: "bg-slate-950 text-white",
  accent: "bg-emerald-50 text-slate-950",
} as const;

export const spacingClassMap = {
  sm: "py-8",
  md: "py-14",
  lg: "py-20",
} as const;
`;

const blockRegistryTemplate = `import { CtaBlock } from "../components/cms/CtaBlock";
import { FaqBlock } from "../components/cms/FaqBlock";
import { FeaturesBlock } from "../components/cms/FeaturesBlock";
import { HeroBlock } from "../components/cms/HeroBlock";
import { TextBlock } from "../components/cms/TextBlock";
import { TextImageBlock } from "../components/cms/TextImageBlock";

export const blockRegistry = {
  hero: HeroBlock,
  text: TextBlock,
  textImage: TextImageBlock,
  features: FeaturesBlock,
  faq: FaqBlock,
  cta: CtaBlock,
} as const;
`;

const blockRendererTemplate = `import type { CmsBlock } from "../../cms/types";
import { blockRegistry } from "../../cms/block-registry";

export function BlockRenderer({ blocks }: { blocks: CmsBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = blockRegistry[block.type as keyof typeof blockRegistry];
        if (!Component) return null;
        return <Component key={block.id} block={block} />;
      })}
    </>
  );
}
`;

const blockComponentBoilerplate = `import type { CmsBlock } from "../../cms/types";
import { spacingClassMap, themeClassMap } from "../../cms/style-maps";

type BlockProps = {
  block: CmsBlock;
};

function getText(value: unknown): string {
  return typeof value === "string" ? value : "";
}
`;

const heroBlockTemplate = `${blockComponentBoilerplate}
export function HeroBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "lg";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-sm font-medium uppercase tracking-wide">{getText(block.props.eyebrow)}</p>
        <h1 className="mt-3 text-4xl font-semibold">{getText(block.props.heading)}</h1>
        <p className="mt-5 max-w-2xl text-lg">{getText(block.props.body)}</p>
      </div>
    </section>
  );
}
`;

const textBlockTemplate = `${blockComponentBoilerplate}
export function TextBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
        <p className="mt-4 text-base leading-7">{getText(block.props.body)}</p>
      </div>
    </section>
  );
}
`;

const textImageBlockTemplate = `${blockComponentBoilerplate}
export function TextImageBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
          <p className="mt-4 text-base leading-7">{getText(block.props.body)}</p>
        </div>
      </div>
    </section>
  );
}
`;

const featuresBlockTemplate = `${blockComponentBoilerplate}
export function FeaturesBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
      </div>
    </section>
  );
}
`;

const faqBlockTemplate = `${blockComponentBoilerplate}
export function FaqBlock({ block }: BlockProps) {
  const theme = block.theme ?? "light";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
      </div>
    </section>
  );
}
`;

const ctaBlockTemplate = `${blockComponentBoilerplate}
export function CtaBlock({ block }: BlockProps) {
  const theme = block.theme ?? "accent";
  const spacing = block.spacing ?? "md";
  return (
    <section className={\`\${themeClassMap[theme]} \${spacingClassMap[spacing]}\`}>
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold">{getText(block.props.heading)}</h2>
        <p className="mt-4">{getText(block.props.body)}</p>
      </div>
    </section>
  );
}
`;
