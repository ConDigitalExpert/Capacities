import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",        // produce a static site in /out
  trailingSlash: true,     // needed for GitHub Pages routing
  images: {
    unoptimized: true,     // static export can't use Next.js image optimisation
  },
};

export default nextConfig;
