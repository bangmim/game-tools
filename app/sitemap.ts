import type { MetadataRoute } from "next";
import { GAMES } from "@/data/games";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
  for (const g of GAMES) {
    base.push(
      {
        url: `${SITE_URL}/${g.slug}/`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/${g.slug}/gacha/`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/${g.slug}/coupon/`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      },
    );
  }
  return base;
}
