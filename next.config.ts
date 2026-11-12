import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? " ws: http://localhost:4747" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactCompiler: true,
  experimental: {
    useTypeScriptCli: false,
    webpackBuildWorker: false,
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    qualities: [75, 85, 95],
  },
  async redirects() {
    return [
      {
        source: "/opengraph-image",
        destination: "/media/kubar-labs-og-b2add55b.png",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "www.kubar.tech" }],
        destination: "https://kubar.tech/",
        permanent: true,
      },
      {
        source: "/:path+",
        has: [{ type: "host", value: "www.kubar.tech" }],
        destination: "https://kubar.tech/:path+",
        permanent: true,
      },
      // Short link for the investor pre-read deck. Temporary (307) so the
      // target can be repointed when the deck is updated.
      {
        source: "/deck",
        destination:
          "https://drive.google.com/file/d/15lAsUkbesEdhr2aNZsefCe_h4Cffo20I/view?usp=sharing",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=86400",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
      {
        source: "/:asset(icon\\.png|logo\\.png|nd_logo\\.png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:directory(logos|team|advisors|bft_logos)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
