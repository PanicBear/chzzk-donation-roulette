import { client } from "@/libs";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { channelId } = req.query;

  const chatChannelId = await axios
    .get(
      `https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`
    )
    .then((result) => result.data)
    .then((data) => data["content"]?.["chatChannelId"])
    .catch();

  const accessToken: string | undefined = await fetch(
    `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${
      chatChannelId ?? ""
    }&chatType=STREAMING`
  )
    .then((r) => r.json())
    .then((data) => {
      return data["content"]["accessToken"];
    })
    .catch();

  return res.json({ chatChannelId, accessToken });
}
