/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/admin',
    output: "standalone",
    images: {
        domains: ['assets.yclients.com'],
      },
};

export default nextConfig;
