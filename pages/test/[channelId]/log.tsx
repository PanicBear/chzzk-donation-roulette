import Button from "@/components/button";
import Roulette from "@/components/roulette";
import { OPTION_DEFAULT } from "@/constants";
import useStorage from "@/hooks/useStorage";
import { Option } from "@/types";
import rollRoulette from "@/utils/roll/roulette";
import { ChzzkChat, donationTypeName } from "chzzk";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlotCounterRef } from "react-slot-counter";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "uuid";

export default function Page({
  chatChannelId,
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <section
      className={twMerge("flex flex-col justify-start items-start gap-4")}
    >
      <div className={twMerge("flex justify-start gap-4")}>
        <span>채팅정보</span>
        <span>{chatChannelId}</span>
        <span>{accessToken}</span>
        {/* <span>{data?.chatChannelId}</span>
        <span>{data?.accessToken}</span> */}
      </div>
    </section>
  );
}

export const getServerSideProps = (async (context) => {
  const channelId = context.query.channelId;

  const { signal } = new AbortController();

  const chatChannelId = await fetch(
    `https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`,
    { signal }
  )
    .then((r) => r.json())
    .then((data) => data["content"]?.["chatChannelId"]);

  console.log(channelId);
  console.log(chatChannelId);

  // const accessToken = await fetch(
  //   `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`,
  //   { signal }
  // )
  //   .then((r) => r.json())
  //   .then((data) => data["content"]["accessToken"]);

  return { props: { accessToken: "", chatChannelId } };
}) satisfies GetServerSideProps<{
  accessToken?: string;
  chatChannelId?: string;
}>;
