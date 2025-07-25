/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'epamigsistema.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
