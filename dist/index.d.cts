import { z } from 'zod';

declare const cmsSeoSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    indexable: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    title: string;
    description: string;
    indexable: boolean;
    image?: string | undefined;
}, {
    title: string;
    description: string;
    image?: string | undefined;
    indexable?: boolean | undefined;
}>, {
    title: string;
    description: string;
    indexable: boolean;
    image?: string | undefined;
}, {
    title: string;
    description: string;
    image?: string | undefined;
    indexable?: boolean | undefined;
}>;
declare const cmsSectionSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    variant: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodEnum<["light", "muted", "dark", "accent"]>>;
    spacing: z.ZodOptional<z.ZodString>;
    props: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    type: string;
    id: string;
    props: Record<string, unknown>;
    variant?: string | undefined;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    spacing?: string | undefined;
}, {
    type: string;
    id: string;
    variant?: string | undefined;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    spacing?: string | undefined;
    props?: Record<string, unknown> | undefined;
}>, {
    type: string;
    id: string;
    props: Record<string, unknown>;
    variant?: string | undefined;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    spacing?: string | undefined;
}, {
    type: string;
    id: string;
    variant?: string | undefined;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    spacing?: string | undefined;
    props?: Record<string, unknown> | undefined;
}>;
declare const cmsPageSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    locale: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    seo: z.ZodEffects<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        image: z.ZodOptional<z.ZodString>;
        indexable: z.ZodDefault<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    }, {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    }>, {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    }, {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    }>;
    sections: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        variant: z.ZodOptional<z.ZodString>;
        theme: z.ZodOptional<z.ZodEnum<["light", "muted", "dark", "accent"]>>;
        spacing: z.ZodOptional<z.ZodString>;
        props: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }, {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }>, {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }, {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }>, "many">>;
    blocks: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        variant: z.ZodOptional<z.ZodString>;
        theme: z.ZodOptional<z.ZodEnum<["light", "muted", "dark", "accent"]>>;
        spacing: z.ZodOptional<z.ZodString>;
        props: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }, {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }>, {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }, {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    title: string;
    id: string;
    locale: string;
    slug: string;
    seo: {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    };
    sections?: {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }[] | undefined;
    blocks?: {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }[] | undefined;
}, {
    title: string;
    id: string;
    locale: string;
    slug: string;
    seo: {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    };
    sections?: {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }[] | undefined;
    blocks?: {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }[] | undefined;
}>, {
    title: string;
    id: string;
    locale: string;
    slug: string;
    seo: {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    };
    sections?: {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }[] | undefined;
    blocks?: {
        type: string;
        id: string;
        props: Record<string, unknown>;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
    }[] | undefined;
}, {
    title: string;
    id: string;
    locale: string;
    slug: string;
    seo: {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    };
    sections?: {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }[] | undefined;
    blocks?: {
        type: string;
        id: string;
        variant?: string | undefined;
        theme?: "light" | "muted" | "dark" | "accent" | undefined;
        spacing?: string | undefined;
        props?: Record<string, unknown> | undefined;
    }[] | undefined;
}>;
declare const cmsSiteSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    defaultLocale: z.ZodOptional<z.ZodString>;
    seo: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        image: z.ZodOptional<z.ZodString>;
        indexable: z.ZodDefault<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    }, {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    }>, {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    }, {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    }>>;
    theme: z.ZodOptional<z.ZodEnum<["light", "muted", "dark", "accent"]>>;
}, "strict", z.ZodTypeAny, {
    name: string;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    seo?: {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    } | undefined;
    defaultLocale?: string | undefined;
}, {
    name: string;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    seo?: {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    } | undefined;
    defaultLocale?: string | undefined;
}>, {
    name: string;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    seo?: {
        title: string;
        description: string;
        indexable: boolean;
        image?: string | undefined;
    } | undefined;
    defaultLocale?: string | undefined;
}, {
    name: string;
    theme?: "light" | "muted" | "dark" | "accent" | undefined;
    seo?: {
        title: string;
        description: string;
        image?: string | undefined;
        indexable?: boolean | undefined;
    } | undefined;
    defaultLocale?: string | undefined;
}>;
type NavigationItem = {
    label: string;
    href: string;
    locale?: string;
    children?: NavigationItem[];
};
declare const cmsNavigationSchema: z.ZodEffects<z.ZodObject<{
    items: z.ZodDefault<z.ZodArray<z.ZodType<NavigationItem, z.ZodTypeDef, NavigationItem>, "many">>;
}, "strict", z.ZodTypeAny, {
    items: NavigationItem[];
}, {
    items?: NavigationItem[] | undefined;
}>, {
    items: NavigationItem[];
}, {
    items?: NavigationItem[] | undefined;
}>;
declare const cmsManifestSchema: z.ZodEffects<z.ZodObject<{
    version: z.ZodNumber;
    project: z.ZodObject<{
        name: z.ZodString;
        framework: z.ZodLiteral<"nextjs">;
        router: z.ZodOptional<z.ZodEnum<["app", "pages"]>>;
        language: z.ZodOptional<z.ZodEnum<["typescript", "javascript"]>>;
        styling: z.ZodOptional<z.ZodEnum<["tailwind", "css", "scss", "other"]>>;
    }, "strict", z.ZodTypeAny, {
        name: string;
        framework: "nextjs";
        router?: "app" | "pages" | undefined;
        language?: "typescript" | "javascript" | undefined;
        styling?: "tailwind" | "css" | "scss" | "other" | undefined;
    }, {
        name: string;
        framework: "nextjs";
        router?: "app" | "pages" | undefined;
        language?: "typescript" | "javascript" | undefined;
        styling?: "tailwind" | "css" | "scss" | "other" | undefined;
    }>;
    content: z.ZodObject<{
        root: z.ZodString;
        pages: z.ZodString;
        site: z.ZodOptional<z.ZodString>;
        navigation: z.ZodOptional<z.ZodString>;
        assets: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        pages: string;
        root: string;
        site?: string | undefined;
        navigation?: string | undefined;
        assets?: string | undefined;
    }, {
        pages: string;
        root: string;
        site?: string | undefined;
        navigation?: string | undefined;
        assets?: string | undefined;
    }>;
    localization: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
        defaultLocale: z.ZodString;
        locales: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        defaultLocale: string;
        enabled: boolean;
        locales: string[];
    }, {
        defaultLocale: string;
        enabled: boolean;
        locales: string[];
    }>>;
    build: z.ZodOptional<z.ZodObject<{
        installCommand: z.ZodOptional<z.ZodString>;
        buildCommand: z.ZodOptional<z.ZodString>;
        validateCommand: z.ZodOptional<z.ZodString>;
        output: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        installCommand?: string | undefined;
        buildCommand?: string | undefined;
        validateCommand?: string | undefined;
        output?: string | undefined;
    }, {
        installCommand?: string | undefined;
        buildCommand?: string | undefined;
        validateCommand?: string | undefined;
        output?: string | undefined;
    }>>;
    publishing: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodLiteral<"github">>;
        branch: z.ZodOptional<z.ZodString>;
        mode: z.ZodOptional<z.ZodEnum<["commit", "pull-request"]>>;
    }, "strict", z.ZodTypeAny, {
        provider?: "github" | undefined;
        branch?: string | undefined;
        mode?: "commit" | "pull-request" | undefined;
    }, {
        provider?: "github" | undefined;
        branch?: string | undefined;
        mode?: "commit" | "pull-request" | undefined;
    }>>;
    features: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    editable: z.ZodOptional<z.ZodObject<{
        files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strict", z.ZodTypeAny, {
        files?: string[] | undefined;
    }, {
        files?: string[] | undefined;
    }>>;
    blocks: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    version: number;
    project: {
        name: string;
        framework: "nextjs";
        router?: "app" | "pages" | undefined;
        language?: "typescript" | "javascript" | undefined;
        styling?: "tailwind" | "css" | "scss" | "other" | undefined;
    };
    content: {
        pages: string;
        root: string;
        site?: string | undefined;
        navigation?: string | undefined;
        assets?: string | undefined;
    };
    blocks?: Record<string, unknown> | undefined;
    localization?: {
        defaultLocale: string;
        enabled: boolean;
        locales: string[];
    } | undefined;
    build?: {
        installCommand?: string | undefined;
        buildCommand?: string | undefined;
        validateCommand?: string | undefined;
        output?: string | undefined;
    } | undefined;
    publishing?: {
        provider?: "github" | undefined;
        branch?: string | undefined;
        mode?: "commit" | "pull-request" | undefined;
    } | undefined;
    features?: Record<string, boolean> | undefined;
    editable?: {
        files?: string[] | undefined;
    } | undefined;
}, {
    version: number;
    project: {
        name: string;
        framework: "nextjs";
        router?: "app" | "pages" | undefined;
        language?: "typescript" | "javascript" | undefined;
        styling?: "tailwind" | "css" | "scss" | "other" | undefined;
    };
    content: {
        pages: string;
        root: string;
        site?: string | undefined;
        navigation?: string | undefined;
        assets?: string | undefined;
    };
    blocks?: Record<string, unknown> | undefined;
    localization?: {
        defaultLocale: string;
        enabled: boolean;
        locales: string[];
    } | undefined;
    build?: {
        installCommand?: string | undefined;
        buildCommand?: string | undefined;
        validateCommand?: string | undefined;
        output?: string | undefined;
    } | undefined;
    publishing?: {
        provider?: "github" | undefined;
        branch?: string | undefined;
        mode?: "commit" | "pull-request" | undefined;
    } | undefined;
    features?: Record<string, boolean> | undefined;
    editable?: {
        files?: string[] | undefined;
    } | undefined;
}>, {
    version: number;
    project: {
        name: string;
        framework: "nextjs";
        router?: "app" | "pages" | undefined;
        language?: "typescript" | "javascript" | undefined;
        styling?: "tailwind" | "css" | "scss" | "other" | undefined;
    };
    content: {
        pages: string;
        root: string;
        site?: string | undefined;
        navigation?: string | undefined;
        assets?: string | undefined;
    };
    blocks?: Record<string, unknown> | undefined;
    localization?: {
        defaultLocale: string;
        enabled: boolean;
        locales: string[];
    } | undefined;
    build?: {
        installCommand?: string | undefined;
        buildCommand?: string | undefined;
        validateCommand?: string | undefined;
        output?: string | undefined;
    } | undefined;
    publishing?: {
        provider?: "github" | undefined;
        branch?: string | undefined;
        mode?: "commit" | "pull-request" | undefined;
    } | undefined;
    features?: Record<string, boolean> | undefined;
    editable?: {
        files?: string[] | undefined;
    } | undefined;
}, {
    version: number;
    project: {
        name: string;
        framework: "nextjs";
        router?: "app" | "pages" | undefined;
        language?: "typescript" | "javascript" | undefined;
        styling?: "tailwind" | "css" | "scss" | "other" | undefined;
    };
    content: {
        pages: string;
        root: string;
        site?: string | undefined;
        navigation?: string | undefined;
        assets?: string | undefined;
    };
    blocks?: Record<string, unknown> | undefined;
    localization?: {
        defaultLocale: string;
        enabled: boolean;
        locales: string[];
    } | undefined;
    build?: {
        installCommand?: string | undefined;
        buildCommand?: string | undefined;
        validateCommand?: string | undefined;
        output?: string | undefined;
    } | undefined;
    publishing?: {
        provider?: "github" | undefined;
        branch?: string | undefined;
        mode?: "commit" | "pull-request" | undefined;
    } | undefined;
    features?: Record<string, boolean> | undefined;
    editable?: {
        files?: string[] | undefined;
    } | undefined;
}>;
type CmsManifest = z.infer<typeof cmsManifestSchema>;
type CmsSeo = z.infer<typeof cmsSeoSchema>;
type CmsSection = z.infer<typeof cmsSectionSchema>;
type CmsPage = z.infer<typeof cmsPageSchema>;
type CmsSite = z.infer<typeof cmsSiteSchema>;
type CmsNavigation = z.infer<typeof cmsNavigationSchema>;

type ValidationSeverity = "error" | "warning";
type ValidationIssue = {
    severity: ValidationSeverity;
    code: string;
    file: string;
    message: string;
    path?: string;
};
type ValidateProjectOptions = {
    projectRoot?: string;
};
type ValidateProjectResult = {
    valid: boolean;
    projectRoot: string;
    checkedFiles: string[];
    issues: ValidationIssue[];
};
declare function validateProject(options?: ValidateProjectOptions): ValidateProjectResult;

export { type CmsManifest, type CmsNavigation, type CmsPage, type CmsSection, type CmsSeo, type CmsSite, type ValidateProjectOptions, type ValidateProjectResult, type ValidationIssue, type ValidationSeverity, cmsManifestSchema, cmsNavigationSchema, cmsPageSchema, cmsSectionSchema, cmsSeoSchema, cmsSiteSchema, validateProject };
