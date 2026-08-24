import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Scoped to this project's own Storage bucket path, not the whole
    // shared firebasestorage.googleapis.com host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: `/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/**`,
      },
    ],
  },
};

export default nextConfig;
