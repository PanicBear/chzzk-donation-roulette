import useChatList, { nicknameColors } from "@/hooks/useChatList";
import { Chat } from "@/types";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { Fragment, memo, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const emojiRegex = /{:([a-zA-Z0-9_]+):}/g;

const ChatRow = memo((props: Chat) => {
  const { nickname, badges, color, emojis, message } = props;
  const match = message.match(emojiRegex);

  return (
    <div
      className={twMerge("flex justify-start items-center gap-2")}
      data-from={nickname}
    >
      <span
        className={twMerge("flex justify-start items-center")}
        style={{
          color: typeof color == "number" ? nicknameColors[color] : color,
        }}
      >
        {badges.map((src, i) => (
          <Image
            key={i}
            width={18}
            height={18}
            className={twMerge("inline", "mr-1")}
            alt=""
            src={src}
          />
        ))}
        <span className="name">{nickname}</span>
        <span className="colon">:</span>
      </span>
      <span className={twMerge("flex justify-start items-center")}>
        {match
          ? message.split(emojiRegex).map((part, i) => (
              <Fragment key={i}>
                {i % 2 == 0 ? (
                  part
                ) : (
                  <span>
                    <Image
                      width={24}
                      height={24}
                      alt={`{:${part}:}`}
                      src={emojis[part]}
                    />
                  </span>
                )}
              </Fragment>
            ))
          : message}
      </span>
    </div>
  );
});

export default function Page({
  chatChannelId,
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const chatList = useChatList(chatChannelId, accessToken);

  return (
    <section>
      <div className={twMerge("flex justify-start gap-4")}>
        <span>{chatChannelId}</span>
        <span>{accessToken}</span>
      </div>

      <div className={twMerge("flex flex-col justify-start gap-4")}>
        {chatList.map((chat) =>
          chat ? (
            <ChatRow
              key={chat?.uid ?? Math.ceil(Math.random() * 10 ** 10)}
              {...chat}
            />
          ) : (
            <></>
          )
        )}
      </div>
    </section>
  );
}

export const getServerSideProps = (async () => {
  const channelId = "458f6ec20b034f49e0fc6d03921646d2";

  const { signal } = new AbortController();

  const chatChannelId = await fetch(
    `https://api.chzzk.naver.com/polling/v2/channels/${channelId}/live-status`,
    { signal }
  )
    .then((r) => r.json())
    .then((data) => data["content"]?.["chatChannelId"]);

  const accessToken = await fetch(
    `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`,
    { signal }
  )
    .then((r) => r.json())
    .then((data) => data["content"]["accessToken"]);

  return { props: { accessToken, chatChannelId } };
}) satisfies GetServerSideProps<{
  accessToken?: string;
  chatChannelId?: string;
}>;

ChatRow.displayName = "ChatRow";
