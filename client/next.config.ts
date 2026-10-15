import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    return [
      {
        source: "/assets/:path*",
        destination: "http://127.0.0.1:9090/assets/:path*",
      },
    ]
  },
}

export default nextConfig
