import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @libsql/client / @sendgrid/mail はサーバー専用。バンドルせず外部依存として扱う。
  serverExternalPackages: ["@libsql/client", "@sendgrid/mail"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rpk6snz1bj3dcdnk.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
