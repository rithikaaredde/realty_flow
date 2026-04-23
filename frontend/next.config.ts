import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "placehold.co",
      "res.cloudinary.com", // ✅ added this
    ],
  },
};

export default nextConfig;