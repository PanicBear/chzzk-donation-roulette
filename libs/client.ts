import { ChzzkClient } from "chzzk";

const options = {
  baseUrls: {
    chzzkBaseUrl: process.env.CHZZK_BASE_URL,
    gameBaseUrl: process.env.GAME_BASE_URL,
  },
  nidAuth: process.env.CHANNEL_ID,
  nidSession: process.env.NID_SESSION,
};

const client = new ChzzkClient(options);

export default client;
