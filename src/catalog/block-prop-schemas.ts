import { z } from "zod";

export const ctaSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    href: z.string().trim().min(1),
  })
  .strict();

export const imageSchema = z
  .object({
    src: z.string().trim().min(1),
    alt: z.string().trim().min(1),
    caption: z.string().trim().optional(),
  })
  .strict();

export const reviewSchema = z
  .object({
    author: z.string().trim().min(1).optional(),
    text: z.string().trim().min(1).max(500),
    rating: z.number().min(1).max(5).optional(),
    source: z.string().trim().optional(),
  })
  .strict();

export const faqItemSchema = z
  .object({
    question: z.string().trim().min(1).max(140),
    answer: z.string().trim().min(1).max(700),
  })
  .strict();

export const heroDefaultPropsSchema = z
  .object({
    eyebrow: z.string().trim().max(80).optional(),
    heading: z.string().trim().min(1).max(120),
    subheading: z.string().trim().max(260).optional(),
    primaryCta: ctaSchema.optional(),
    secondaryCta: ctaSchema.optional(),
    image: imageSchema.optional(),
  })
  .strict();

export const heroLocalGastroPropsSchema = z
  .object({
    eyebrow: z.string().trim().max(80).optional(),
    heading: z.string().trim().min(1).max(120),
    subheading: z.string().trim().min(1).max(260),
    locationLabel: z.string().trim().max(120).optional(),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema.optional(),
    image: imageSchema.optional(),
    trustNote: z.string().trim().max(160).optional(),
  })
  .strict();

export const heroServicePropsSchema = z
  .object({
    eyebrow: z.string().trim().max(80).optional(),
    heading: z.string().trim().min(1).max(120),
    subheading: z.string().trim().min(1).max(260),
    serviceArea: z.string().trim().max(160).optional(),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema.optional(),
    phoneLabel: z.string().trim().max(80).optional(),
    image: imageSchema.optional(),
    trustBadges: z.array(z.string().trim().min(1).max(80)).max(4).optional(),
  })
  .strict();

export const servicesGridPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    intro: z.string().trim().max(260).optional(),
    services: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(100),
            description: z.string().trim().min(1).max(260),
            icon: z.string().trim().max(80).optional(),
            href: z.string().trim().optional(),
          })
          .strict(),
      )
      .min(1)
      .max(12),
  })
  .strict();

export const servicesWithPricesPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    intro: z.string().trim().max(260).optional(),
    services: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(100),
            description: z.string().trim().max(260).optional(),
            price: z.string().trim().max(80).optional(),
            duration: z.string().trim().max(80).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(30),
    note: z.string().trim().max(220).optional(),
  })
  .strict();

export const menuPreviewPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    intro: z.string().trim().max(260).optional(),
    items: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(100),
            description: z.string().trim().max(260).optional(),
            price: z.string().trim().max(80).optional(),
            tags: z.array(z.string().trim().min(1).max(40)).max(5).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(20),
    menuHref: z.string().trim().optional(),
  })
  .strict();

export const openingHoursPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    hours: z
      .array(
        z
          .object({
            day: z.string().trim().min(1).max(40),
            value: z.string().trim().min(1).max(80),
          })
          .strict(),
      )
      .min(1)
      .max(14),
    note: z.string().trim().max(220).optional(),
  })
  .strict();

export const locationMapPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(240),
    mapEmbedUrl: z.string().trim().optional(),
    parkingInfo: z.string().trim().max(220).optional(),
    publicTransportInfo: z.string().trim().max(220).optional(),
    primaryCta: ctaSchema.optional(),
  })
  .strict();

export const reviewsPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    intro: z.string().trim().max(260).optional(),
    ratingSummary: z
      .object({
        rating: z.number().min(1).max(5),
        count: z.number().int().min(1),
        source: z.string().trim().min(1).max(80),
      })
      .strict()
      .optional(),
    reviews: z.array(reviewSchema).min(1).max(12),
  })
  .strict();

export const galleryPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120).optional(),
    intro: z.string().trim().max(260).optional(),
    images: z.array(imageSchema).min(1).max(30),
  })
  .strict();

export const beforeAfterGalleryPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120).optional(),
    intro: z.string().trim().max(260).optional(),
    pairs: z
      .array(
        z
          .object({
            before: imageSchema,
            after: imageSchema,
            caption: z.string().trim().max(220).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(12),
  })
  .strict();

export const contactFormPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    intro: z.string().trim().max(260).optional(),
    submitLabel: z.string().trim().min(1).max(80),
    fields: z.array(z.enum(["name", "email", "phone", "message", "service", "date"])).min(1).max(8),
    privacyNote: z.string().trim().max(260).optional(),
  })
  .strict();

export const bookingCtaPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    text: z.string().trim().min(1).max(260),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema.optional(),
  })
  .strict();

export const faqPropsSchema = z
  .object({
    heading: z.string().trim().min(1).max(120),
    intro: z.string().trim().max(260).optional(),
    items: z.array(faqItemSchema).min(1).max(12),
  })
  .strict();

export const sectionIntroPropsSchema = z
  .object({
    eyebrow: z.string().trim().max(80).optional(),
    heading: z.string().trim().min(1).max(120),
    text: z.string().trim().max(300).optional(),
  })
  .strict();

export const contactStripPropsSchema = z
  .object({
    text: z.string().trim().min(1).max(180),
    phone: z.string().trim().max(80).optional(),
    email: z.string().trim().max(120).optional(),
    address: z.string().trim().max(180).optional(),
    primaryCta: ctaSchema.optional(),
  })
  .strict();

export const blockPropSchemas = {
  "hero-default": heroDefaultPropsSchema,
  "hero-local-gastro": heroLocalGastroPropsSchema,
  "hero-service": heroServicePropsSchema,
  "services-grid": servicesGridPropsSchema,
  "services-with-prices": servicesWithPricesPropsSchema,
  "menu-preview": menuPreviewPropsSchema,
  "opening-hours": openingHoursPropsSchema,
  "location-map": locationMapPropsSchema,
  reviews: reviewsPropsSchema,
  gallery: galleryPropsSchema,
  "before-after-gallery": beforeAfterGalleryPropsSchema,
  "contact-form": contactFormPropsSchema,
  "booking-cta": bookingCtaPropsSchema,
  faq: faqPropsSchema,
  "section-intro": sectionIntroPropsSchema,
  "contact-strip": contactStripPropsSchema,
} as const;

export type BlockTypeWithPropSchema = keyof typeof blockPropSchemas;
