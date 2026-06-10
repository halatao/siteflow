export const componentRoles = [
  "layout",
  "hero",
  "navigation",
  "offer",
  "conversion",
  "trust",
  "story",
  "media",
  "local",
  "commerce",
  "event",
  "real-estate",
  "support",
  "seo",
  "utility",
] as const;

export type ComponentRole = (typeof componentRoles)[number];
