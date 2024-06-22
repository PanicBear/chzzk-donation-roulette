import CNavBar from "@/components/navbar";
import { client } from "@/libs";
import { LiveDetail } from "chzzk";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function Page({
  liveDetail,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [rows, setRows] = useState<string[]>([]);

  useEffect(() => {
    if (!liveDetail) return;

    const media = liveDetail.livePlayback.media; // 방송 중이 아닐 경우 비어있음
    const hls = media.find((media) => media.mediaId === "HLS"); // HLS, LLHLS

    if (hls) {
      client
        .fetch(hls.path)
        .then((r) => r.text())
        .then((result) => setRows(result.split("\n")));
    }
  }, [liveDetail]);

  return (
    <ul className={twMerge("flex flex-col gap-4")}>
      {rows.map((row, index) => {
        return (
          <li key={index} className={twMerge("flex flex-col gap-4")}>
            {row}
          </li>
        );
      })}
    </ul>
  );
}

export const getServerSideProps = (async () => {
  const result = await client.search.channels("이글콥");

  const channel = result.channels[0];

  const liveDetail = await client.live.detail(channel.channelId);

  return { props: { liveDetail } };
}) satisfies GetServerSideProps<{ liveDetail: LiveDetail }>;
