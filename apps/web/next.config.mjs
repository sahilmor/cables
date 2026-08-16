/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cables/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
