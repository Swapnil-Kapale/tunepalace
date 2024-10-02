/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'hirelink-web-storage.s3.ap-south-1.amazonaws.com'
      }
    ]
  
  }
};

export default nextConfig;
