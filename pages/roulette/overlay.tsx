import Slot from "@/components/slot";
import { ROLL_PERCENTAGE } from "@/constants";
import rollSlot from "@/utils/roll/roulette";
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
  const [queue, setQueue] = useState<Queue[]>([]);

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

          if (donation.profile?.nickname) {
            setQueue((prev) => {
              return [
                ...prev,
                {
                  id: uuid(),
                  nickname: donation.profile?.nickname ?? "익명의 후원자",
                  chance: 1,
                  message: donation.message,
                },
              ];
            });
          }
        }
      });

      client.on("chat", (chat) => {
        const message = chat.hidden ? "[블라인드 처리 됨]" : chat.message;
        // console.log(`${chat.profile.nickname}: ${message}`);

        // const chance = getDummyCount(message);

        // chance &&
        setQueue((prev) => {
          return [
            ...prev,
            { id: uuid(), nickname: chat.profile.nickname, message, chance: 1 },
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
    }, 2500);

    return () => {
      intervalId.current && clearInterval(intervalId.current);
    };
  }, [queue.length]);

  useEffect(() => {
    instance.current || handleConnect();
  }, [handleConnect]);

  return (
    <section
      className={twMerge("flex flex-col justify-start items-start gap-4")}
    >
      <div
        id="log"
        className={twMerge("flex flex-col justify-start items-start gap-2")}
      >
        {!!queue.length && (
          <Slot key={queue?.[0].id} won={rollSlot(ROLL_PERCENTAGE)} />
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
