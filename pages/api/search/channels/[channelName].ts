import { client } from "@/libs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { channelName } = req.query;

  const result = await client.search.channels(channelName + "");

  client.user;

  res.json(result);
}
