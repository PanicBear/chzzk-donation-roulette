/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "ssl.pstatic.net", // 구독 등 뱃지
      "nng-phinf.pstatic.net", // 이모티콘
    ],
  },
};

export default nextConfig;
