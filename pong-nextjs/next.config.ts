/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.giphy.com',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
}

                   module.exports = nextConfig