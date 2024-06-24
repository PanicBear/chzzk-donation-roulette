import Button from "@/components/button";
import Slot from "@/components/slot";
import { ROLL_PERCENTAGE } from "@/constants";
import roll from "@/utils/roll";
import { ChzzkChat, donationTypeName } from "chzzk";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "uuid";

type Queue = {
  id: string;
  nickname: string;
  message: string;
  chance: number;
};

const getDummyCount = (str: string) => {
  // const re = /{:eaglekKopguri:}/g;
  const re = /\?|ㅋ/g;
  return ((str || "").match(re) || []).length % 3;
};

export default function Page({
  chatChannelId,
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const intervalId = useRef<NodeJS.Timeout | null>();
  const instance = useRef<ChzzkChat | null>(null);
  const [queue, setQueue] = useState<Queue[]>([
    {
      id: "test1",
      nickname: "test",
      message: "msg",
      chance: 1,
    },
    {
      id: "test2",
      nickname: "test",
      message: "msg",
      chance: 1,
    },
    {
      id: "test3",
      nickname: "test",
      message: "msg",
      chance: 1,
    },
    {
      id: "test4",
      nickname: "test",
      message: "msg",
      chance: 1,
    },
    {
      id: "test1",
      nickname: "test",
      message: "msg",
      chance: 1,
    },
  ]);
  const [percent, setPercent] = useState<number>(ROLL_PERCENTAGE);

  const handleConnect = useCallback(() => {
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

          // setQueue((prev) => {
          //   return [
          //     ...prev,
          //     {
          //       nickname: donation.profile?.nickname ?? "익명의 후원자",
          //       chance: 1,
          //       message: donation.message,
          //     },
          //   ];
          // });

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

        const chance = getDummyCount(message);

        chance &&
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

  useEffect(() => {
    if (!queue.length) return;

    intervalId.current = setInterval(() => {
      setQueue((prev) => {
        const [top, ...rest] = prev;

        const chance = top.chance - 1;

        console.log(`${top.nickname}: ${top.message}`);

        if (chance) {
          return [{ ...top, chance }, ...rest];
        }

        if (!rest.length) {
          intervalId.current && clearInterval(intervalId.current);
          return [];
        }

        return [...rest];
      });
    }, 2000);

    return () => {
      intervalId.current && clearInterval(intervalId.current);
    };
  }, [queue.length]);

  return (
    <section
      className={twMerge("flex flex-col justify-start items-start gap-4")}
    >
      <div className={twMerge("flex justify-start gap-4")}>
        <span>{chatChannelId}</span>
        <span>{accessToken}</span>
      </div>

      <div className={twMerge("flex justify-start items-center gap-4")}>
        <Button onClick={handleConnect}>연결하기</Button>
        <Button onClick={handleDisconnect}>연결끊기</Button>
      </div>
      <div className={twMerge("flex flex-col justify-start items-start gap-2")}>
        <span>도네이션 목록</span>

        {!!queue.length && (
          <Slot key={queue?.[0].id} won={roll(ROLL_PERCENTAGE)} />
        )}

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
