/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracing: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = false
    }
    return config
  },
}

export default nextConfig
