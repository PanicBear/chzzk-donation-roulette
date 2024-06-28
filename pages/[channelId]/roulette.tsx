import Button from "@/components/button";
import Roulette from "@/components/roulette";
import { OPTION_DEFAULT } from "@/constants";
import useStorage from "@/hooks/useStorage";
import { Option } from "@/types";
import rollRoulette from "@/utils/roll/roulette";
import { ChzzkChat, donationTypeName } from "chzzk";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlotCounterRef } from "react-slot-counter";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "uuid";

type Queue = {
  id: string;
  nickname: string;
  message: string;
  chance: number;
};

const DURATION = 2;

export default function Page() {
  const router = useRouter();
  const channelId = router.query.channelId + "";

  const { data } = useSWR<{ chatChannelId?: string; accessToken?: string }>(
    router.query.channelId
      ? `/api/chat/clientInfo?channelId=${router.query.channelId}`
      : ""
  );

  const { getItem } = useStorage<{ option: Option[] }>();

  const rouletteRef = useRef<SlotCounterRef>(null);

  const intervalId = useRef<NodeJS.Timeout | null>();
  const instance = useRef<ChzzkChat | null>(null);
  const [queue, setQueue] = useState<Queue[]>([]);
  const [value, setValue] = useState<number>(0);

  const [optionList, setOptionList] = useState<Option[]>(OPTION_DEFAULT);

  const handleConnect = useCallback(() => {
    const chatChannelId = data?.chatChannelId;
    const accessToken = data?.accessToken;

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
  }, [data?.accessToken, data?.chatChannelId]);

  const handleDisconnect = useCallback(() => {
    if (!instance.current) return;

    const client = instance.current;

    client.disconnect().then(() => {
      instance.current = null;
      console.info("disconnected");
    });
  }, []);

  const handlePop = useCallback(async () => {
    if (!queue.length) return;

    setQueue((prev) => {
      const [top, ...rest] = prev;
      if (!top) return [];

      console.log("pop");

      setValue(rollRoulette(optionList));
      rouletteRef.current?.startAnimation();

      const chance = top.chance - 1;
      console.log(`${top.nickname}: ${top.message}`);
      if (chance) {
        return [{ ...top, chance }, ...rest];
      }
      if (!rest.length) {
        intervalId.current && clearInterval(intervalId.current);
        return [];
      }
      return rest;
    });
  }, [optionList, queue.length]);

  useEffect(() => {
    if (!channelId) return;

    const customizedOptions = getItem(channelId + "")?.option;

    customizedOptions && setOptionList(customizedOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  useEffect(() => {
    intervalId.current = setTimeout(function timeout() {
      handlePop();
      setTimeout(timeout, DURATION * 1000 + 250);
    }, DURATION * 1000 + 250);

    // intervalId.current = setInterval(() => {
    //   handlePop();
    // }, DURATION * 1000 + 250);

    return () => {
      intervalId.current && clearInterval(intervalId.current);
    };
  }, [handlePop]);

  return (
    <section
      className={twMerge("flex flex-col justify-start items-start gap-4")}
    >
      <div className={twMerge("flex justify-start gap-4")}>
        <span>채팅정보</span>
        <span>{data?.chatChannelId}</span>
        <span>{data?.accessToken}</span>
      </div>

      <div className={twMerge("flex justify-start items-center gap-4")}>
        <Button onClick={handleConnect}>연결하기</Button>
        <Button onClick={handleDisconnect}>연결끊기</Button>
      </div>
      <div className={twMerge("flex flex-col justify-start items-start gap-2")}>
        <span>도네이션 목록</span>

        <Roulette ref={rouletteRef} value={value} duration={DURATION} />

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
