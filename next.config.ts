import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["logo.clearbit.com", "cdn.brandfetch.io"],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/api/salaries",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=300, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/api/companies/:slug",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/compare",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=60, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
