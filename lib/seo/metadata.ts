import type { Metadata } from "next";
import { SITE, absoluteUrl } from "../site";
import { metaDescription } from "../utils";

export const DEFAULT_OG_IMAGE = "/og-default.jpg";

/** Consistent per-page metadata: canonical URL, Open Graph and Twitter cards. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const desc = metaDescription(description);
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      siteName: SITE.name,
      title: fullTitle,
      description: desc,
      url,
      type,
      locale: SITE.locale,
      images: [{ url: ogImage, alt: imageAlt ?? fullTitle, ...(image ? {} : { width: 1200, height: 630 }) }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
  };
}
