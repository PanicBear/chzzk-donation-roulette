/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "ssl.pstatic.net", // 구독 등 뱃지
      "nng-phinf.pstatic.net", // 이모티콘
    ],
  },
  env: {
    CHANNEL_ID: process.envCHANNEL_ID,
    NID_AUTH: process.envNID_AUTH,
    NID_SESSION: process.envNID_SESSION,
    CHZZK_BASE_URL: process.envCHZZK_BASE_URL,
    GAME_BASE_URL: process.envGAME_BASE_URL,
  },
};

export default nextConfig;
