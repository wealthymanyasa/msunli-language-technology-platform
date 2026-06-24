/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://api:8000/api/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "http://api:8000/auth/:path*",
      },
      {
        source: "/openapi.json",
        destination: "http://api:8000/openapi.json",
      },
    ]
  },
}

export default nextConfig;
