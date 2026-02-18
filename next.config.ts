import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "Capacities";

const nextConfig: NextConfig = {
  output: "export",        // produce a static site in /out
  trailingSlash: true,     // needed for GitHub Pages routing
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: {
    unoptimized: true,     // static export can't use Next.js image optimisation
  },
};

export default nextConfig;
