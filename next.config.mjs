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
    CHANNEL_ID: process.env.CHANNEL_ID,
    NID_AUTH: process.env.NID_AUTH,
    NID_SESSION: process.env.NID_SESSION,
    CHZZK_BASE_URL: process.env.CHZZK_BASE_URL,
    GAME_BASE_URL: process.env.GAME_BASE_URL,
    FB_API_KEY: process.env.FB_API_KEY,
    FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
    FB_DATABASE_URL: process.env.FB_DATABASE_URL,
    FB_PROJECT_ID: process.env.FB_PROJECT_ID,
    FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
    FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
    FB_APP_ID: process.env.FB_APP_ID,
  },
};

export default nextConfig;
