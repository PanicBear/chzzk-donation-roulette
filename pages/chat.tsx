import Chatrow from "@/components/chatrow";
import useChatList from "@/hooks/useChatList";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { twMerge } from "tailwind-merge";

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
            <Chatrow
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
  const channelId = process.env.CHANNEL_ID;

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
