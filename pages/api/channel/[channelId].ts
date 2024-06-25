import { client } from "@/libs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { channelId } = req.query;

  const result = await client.channel(channelId + "");

  res.json(result);
}
