import type { MetadataRoute } from "next";

const SITE_URL = "https://www.mliphub.com";

const STATIC_PATHS = ["/", "/cite", "/policy", "/contributors", "/contribute"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
