/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://bucket-5dwg.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
