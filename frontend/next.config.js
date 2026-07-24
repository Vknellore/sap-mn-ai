/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Important for serving the site at https://Vknellore.github.io/sap-mn-ai
  basePath: '/sap-mn-ai',
  assetPrefix: '/sap-mn-ai/'
}

module.exports = nextConfig
