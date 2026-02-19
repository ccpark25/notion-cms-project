import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "shiki"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Notion 첨부 이미지 (AWS S3)
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      // Notion 정적 파일
      {
        protocol: "https",
        hostname: "*.notion-static.com",
      },
      // Notion 파일 업로드
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      // Unsplash 이미지
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
