import Button from "@/components/button";
import Input from "@/components/input";
import Chat from "@/components/list/chat";
import Donation from "@/components/list/donation";
import Subscription from "@/components/list/subscription";
import { LogOption } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Channel, ChzzkChat, Events } from "chzzk";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

const Greeting = memo(({ channel }: { channel?: Channel | null }) => {
  if (channel === null) return <span>채널 정보를 찾을 수 없습니다.</span>;
  if (!channel) return <></>;

  return (
    <div
      className={twMerge(
        "p-4 pb-0",
        "flex justify-start items-center",
        "space-x-4"
      )}
    >
      <span>{`${channel?.channelName}님 안녕하세요!`}</span>
      <Link href={"/"} passHref>
        <Button>뒤로가기</Button>
      </Link>
    </div>
  );
});

export default function Page({
  channelId,
  chatChannelId,
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const instance = useRef<ChzzkChat | null>(null);

  const [isConnected, setConnected] = useState<boolean>(false);

  const [recentChatCnt, setRecentChatCnt] = useState<number>(0);

  const [chatList, setChatList] = useState<Events["chat"][]>([]);
  const [donationList, setDonationList] = useState<Events["donation"][]>([]);
  const [subscriptionList, setSubscriptionList] = useState<
    Events["subscription"][]
  >([]);

  const { data } = useSWR<Channel | null>(
    channelId ? `/api/channel/${channelId}` : ""
  );

  const methods = useForm<LogOption>({
    resolver: zodResolver(LogOption),
    defaultValues: {
      type: "donation",
      filter: "",
      donationType: "",
      amount: 0,
    },
  });

  const handleClearList = useCallback(() => {
    setChatList([]);
    setDonationList([]);
    setSubscriptionList([]);
  }, []);

  const handleConnect = useCallback(() => {
    if (!chatChannelId || !accessToken)
      return alert(
        "채팅 정보 로딩중입니다, 연령 제한이 설정된 경우 채팅창 정보 수신이 불가능합니다."
      );

    if (!instance.current) {
      const client = new ChzzkChat({
        chatChannelId,
        accessToken,
      });

      instance.current = client;

      client.on("connect", () => {
        console.log("connected");
        client.requestRecentChat(recentChatCnt);
        setConnected(true);
      });

      client.on("subscription", (sub) => {
        setSubscriptionList((prev) => [...prev, sub]);
      });

      client.on("donation", (donation) => {
        setDonationList((prev) => [...prev, donation]);
      });

      client.on("chat", (chat) => {
        setChatList((prev) => [...prev, chat]);
      });

      client.on("disconnect", () => {
        setConnected(false);
      });

      client.connect().catch(() => {
        console.info("connection failed");

        instance.current = null;
      });
    }
  }, [accessToken, chatChannelId, recentChatCnt]);

  const handleDisconnect = useCallback(() => {
    if (!instance.current) return;

    const client = instance.current;

    client.disconnect().then(() => {
      instance.current = null;
      setConnected(false);
      handleClearList();
      console.info("disconnected");
    });
  }, [handleClearList]);

  return (
    <>
      <Greeting channel={data} />
      <section
        className={twMerge(
          "p-4",
          "flex flex-col justify-start items-start gap-4"
        )}
      >
        <div className={twMerge("flex flex-col justify-start")}>
          <span className={twMerge("pb-2", "flex-shrink-0")}>채팅정보</span>
          <span>채널 ID: {chatChannelId}</span>
          <span>access token: {accessToken}</span>
        </div>

        <div
          className={twMerge(
            "w-full",
            "p-4",
            "flex flex-col justify-start items-start gap-4",
            "border-2 border-solid border-black",
            "rounded-md"
          )}
        >
          <span>채팅창 연결</span>
          <fieldset
            className={twMerge("flex justify-start items-center gap-4")}
          >
            <label>불러올 지난 구독, 채팅, 도네이션의 합, 최대 10000</label>
            <Input
              className={twMerge(
                "w-24 h-10",
                "p-2",
                "border-2 border-solid border-black rounded-md"
              )}
              onChange={(e) => {
                const value = Number(e.target.value ?? 0);
                const isValid = z
                  .number()
                  .min(0)
                  .max(10000)
                  .safeParse(value).success;

                if (isValid) {
                  setRecentChatCnt(Number(e.target.value ?? 0));
                } else {
                  setRecentChatCnt(10000);
                }
              }}
              value={recentChatCnt}
              type="number"
              min={0}
              max={10000}
            />
          </fieldset>
          <div className={twMerge("flex justify-start items-center gap-4")}>
            <Button onClick={handleConnect}>연결하기</Button>
            <Button onClick={handleDisconnect}>연결끊기</Button>
            <span>
              {isConnected ? "연결되었습니다." : "연결해제되었습니다."}
            </span>
          </div>
        </div>

        <form
          className={twMerge(
            "w-full",
            "p-4",
            "flex flex-col justify-start items-start gap-4",
            "border-2 border-solid border-black",
            "rounded-md"
          )}
        >
          <span>필터 옵션</span>
          <div className={twMerge("grid grid-cols-2 gap-4")}>
            <Controller
              control={methods.control}
              name="type"
              render={({ field }) => {
                return (
                  <fieldset
                    className={twMerge(
                      "flex flex-row justify-start items-center gap-4"
                    )}
                  >
                    <label
                      className={twMerge("w-24", "flex-shrink-0")}
                      htmlFor="list-select"
                    >
                      로그 종류
                    </label>
                    <select {...field} id="list-select">
                      <option value="donation">도네이션</option>
                      <option value="subscription">구독</option>
                      <option value="chat">채팅</option>
                    </select>
                  </fieldset>
                );
              }}
            />
            <Controller
              control={methods.control}
              name="filter"
              render={({ field }) => {
                return (
                  <fieldset
                    className={twMerge(
                      "flex flex-row justify-start items-center gap-4"
                    )}
                  >
                    <label className={twMerge("w-24", "flex-shrink-0")}>
                      메시지
                    </label>
                    <Input {...field} placeholder="포함된 메시지만 출력" />
                  </fieldset>
                );
              }}
            />
            {methods.watch("type") === "donation" && (
              <>
                <Controller
                  control={methods.control}
                  name="donationType"
                  render={({ field }) => {
                    return (
                      <fieldset
                        className={twMerge(
                          "flex flex-row justify-start items-center gap-4"
                        )}
                      >
                        <label
                          className={twMerge("w-24", "flex-shrink-0")}
                          htmlFor="list-donation-type"
                        >
                          도네이션 종류
                        </label>
                        <select {...field} id="list-donation-type">
                          <option value="">전체</option>
                          <option value="CHAT">채팅 후원</option>
                          <option value="MISSION">미션 후원</option>
                          <option value="VIDEO">영상 후원</option>
                        </select>
                      </fieldset>
                    );
                  }}
                />

                <Controller
                  control={methods.control}
                  name="amount"
                  render={({ field }) => {
                    return (
                      <fieldset
                        className={twMerge(
                          "flex flex-row justify-start items-center gap-4"
                        )}
                      >
                        <label className={twMerge("w-24", "flex-shrink-0")}>
                          도네이션 액수
                        </label>
                        <Input {...field} placeholder="정확한 액수만 출력" />
                      </fieldset>
                    );
                  }}
                />
              </>
            )}
          </div>
        </form>
        <Donation list={donationList} control={methods.control} />
        <Subscription list={subscriptionList} control={methods.control} />
        <Chat list={chatList} control={methods.control} />
      </section>
    </>
  );
}

export const getServerSideProps = (async (context) => {
  const channelId = context.query.channelId + "";

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

  return { props: { channelId, accessToken, chatChannelId } };
}) satisfies GetServerSideProps<{
  channelId?: string;
  accessToken?: string;
  chatChannelId?: string;
}>;

Greeting.displayName = "Greeting";
