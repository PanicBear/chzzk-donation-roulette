import Button from "@/components/button";
import { ChzzkChat, donationTypeName } from "chzzk";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "uuid";

export default function Page({
  chatChannelId,
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [queue, setQueue] = useState<any[]>([]);

  const instance = useRef<ChzzkChat | null>(null);

  const handleConnect = useCallback(() => {
    if (!chatChannelId || !accessToken) return alert("채팅 정보 로딩중입니다");

    if (!instance.current) {
      const client = new ChzzkChat({
        chatChannelId,
        accessToken,
      });

      instance.current = client;

      client.on("donation", (donation) => {
        console.log(
          `\n>> ${donation.profile?.nickname ?? "익명의 후원자"} 님의 ${
            donation.extras.payAmount
          }원 ${donationTypeName(donation.extras.donationType)}`
        );
        if (donation.message) {
          console.log(`>> ${donation.message}`);

          setQueue((prev) => {
            return [
              ...prev,
              {
                nickname: donation.profile?.nickname ?? "익명의 후원자",
                chance: 1,
                message: donation.message,
                id: uuid(),
              },
            ];
          });

          // donation.message.includes("(룰렛)") &&
          //   setQueue((prev) => {
          //     return [
          //       ...prev,
          //       {
          //         nickname: donation.profile?.nickname ?? "익명의 후원자",
          //         chance: 1,
          //         message: donation.message,
          //       },
          //     ];
          //   });
        }
      });

      client.on("chat", (chat) => {
        const message = chat.hidden ? "[블라인드 처리 됨]" : chat.message;
        // console.log(`${chat.profile.nickname}: ${message}`);

        // const chance = getDummyCount(message);
        const chance = 1;

        // chance &&
        setQueue((prev) => {
          return [
            ...prev,
            { id: uuid(), nickname: chat.profile.nickname, message, chance },
          ];
        });

        // console.log(message);
        // console.log(queue);

        // 유저의 팔로우 일시 불러오기
        // client.chat.profileCard(chzzkChat.chatChannelId, chat.profile.userIdHash).then(profile => {
        //     const following = profile.streamingProperty.following
        //     console.log(following ? `${following.followDate} 에 팔로우 함` : "팔로우 안함")
        // })
      });

      client
        .connect()
        .then(() => {
          console.info("connected");
        })
        .catch(() => {
          console.info("connection failed");
          instance.current = null;
        });
    }
  }, [accessToken, chatChannelId]);

  const handleDisconnect = useCallback(() => {
    if (!instance.current) return;

    const client = instance.current;

    client.disconnect().then(() => {
      instance.current = null;
      console.info("disconnected");
    });
  }, []);

  return (
    <section
      className={twMerge("flex flex-col justify-start items-start gap-4")}
    >
      <div className={twMerge("flex justify-start gap-4")}>
        <span>채팅정보</span>
        <span>{chatChannelId}</span>
        <span>{accessToken}</span>
      </div>

      <div className={twMerge("flex justify-start items-center gap-4")}>
        <Button onClick={handleConnect}>연결하기</Button>
        <Button onClick={handleDisconnect}>연결끊기</Button>
      </div>

      <ul
        className={twMerge(
          "flex flex-col-reverse justify-start items-start gap-4"
        )}
      >
        {queue.map((queue, index) => {
          return (
            <li
              key={index}
              className={twMerge("flex justify-start items-center gap-4")}
            >
              <span className={twMerge("w-5")}>{index}</span>
              <span className={twMerge("w-36")}>{queue.nickname}</span>
              <span>{queue.chance}</span>
              <span>{queue.message}</span>
            </li>
          );
        })}
      </ul>
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
