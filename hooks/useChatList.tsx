import { ChatCmd } from "@/constants";
import { Chat } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export const nicknameColors = [
  "#ECA843",
  "#EEA05D",
  "#EA723D",
  "#EAA35F",
  "#E98158",
  "#E97F58",
  "#E76D53",
  "#E66D5F",
  "#E56B79",
  "#E16490",
  "#E481AE",
  "#E68199",
  "#DC5E9A",
  "#E16CB5",
  "#D25FAC",
  "#D263AE",
  "#D66CB4",
  "#D071B6",
  "#BA82BE",
  "#AF71B5",
  "#A96BB2",
  "#905FAA",
  "#B38BC2",
  "#9D78B8",
  "#8D7AB8",
  "#7F68AE",
  "#9F99C8",
  "#717DC6",
  "#5E7DCC",
  "#5A90C0",
  "#628DCC",
  "#7994D0",
  "#81A1CA",
  "#ADD2DE",
  "#80BDD3",
  "#83C5D6",
  "#8BC8CB",
  "#91CBC6",
  "#83C3BB",
  "#7DBFB2",
  "#AAD6C2",
  "#84C194",
  "#B3DBB4",
  "#92C896",
  "#94C994",
  "#9FCE8E",
  "#A6D293",
  "#ABD373",
  "#BFDE73",
  "#CCE57D",
];

export default function useChatList(
  chatChannelId: string,
  accessToken: string,
  maxChatLength: number = 50
) {
  const isBrowserUnloadingRef = useRef<boolean>(false);
  const lastSetTimestampRef = useRef<number>(0);
  const pendingChatListRef = useRef<Chat[]>([]);
  const [chatList, setChatList] = useState<(Chat | undefined)[]>([]);
  const [webSocketBuster, setWebSocketBuster] = useState<number>(0);

  const convertChat = useCallback((raw: any): Chat => {
    const profile = JSON.parse(raw["profile"]);
    const extras = JSON.parse(raw["extras"]);
    const nickname = profile.nickname;
    const badge = profile.badge?.imageUrl;
    const donationBadge =
      profile.streamingProperty?.realTimeDonationRanking?.badge?.imageUrl;
    const badges = [badge, donationBadge]
      .concat(
        profile.activityBadges
          ?.filter((badge: { activated?: boolean }) => badge.activated)
          ?.map((badge: { imageUrl?: string }) => badge.imageUrl) ?? []
      )
      .filter((badge) => badge != null);
    const channelId = raw["cid"] || raw["channelId"];
    const color =
      profile.title?.color ??
      (profile.userIdHash + channelId)
        .split("")
        .map((c: string) => c.charCodeAt(0))
        .reduce((a: number, b: number) => a + b, 0) % nicknameColors.length;
    const emojis = extras?.emojis || {};
    const message = raw["msg"] || raw["content"] || "";
    return {
      uid: Math.random().toString(36).substring(2, 12),
      time: raw["msgTime"] || raw["messageTime"],
      nickname,
      badges,
      color,
      emojis,
      message,
    };
  }, []);

  const connectChzzk = useCallback(() => {
    const ws = new WebSocket("wss://kr-ss1.chat.naver.com/chat");

    const worker = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `
                let timeout = null

                onmessage = (e) => {
                    if (e.data === "startPingTimer") {
                        if (timeout != null) {
                            clearTimeout(timeout)
                        }
                        timeout = setTimeout(function reservePing() {
                            postMessage("ping")
                            timeout = setTimeout(reservePing, 20000)
                        }, 20000)
                    }
                    if (e.data === "stop") {
                        if (timeout != null) {
                            clearTimeout(timeout)
                        }
                    }
                }
            `,
          ],
          { type: "application/javascript" }
        )
      )
    );

    worker.onmessage = (e) => {
      if (e.data === "ping") {
        ws.send(
          JSON.stringify({
            ver: "2",
            cmd: ChatCmd.PING,
          })
        );
      }
    };

    const defaults = {
      cid: chatChannelId,
      svcid: "game",
      ver: "2",
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          bdy: {
            accTkn: accessToken,
            auth: "READ",
            devType: 2001,
            uid: null,
          },
          cmd: ChatCmd.CONNECT,
          tid: 1,
          ...defaults,
        })
      );
    };

    ws.onclose = () => {
      if (!isBrowserUnloadingRef.current) {
        setTimeout(() => setWebSocketBuster(new Date().getTime()), 1000);
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      const json = JSON.parse(event.data);

      switch (json.cmd) {
        case ChatCmd.PING:
          ws.send(
            JSON.stringify({
              ver: "2",
              cmd: ChatCmd.PONG,
            })
          );
          break;
        case ChatCmd.CONNECTED:
          const sid = json.bdy.sid;
          ws.send(
            JSON.stringify({
              bdy: { recentMessageCount: maxChatLength },
              cmd: ChatCmd.REQUEST_RECENT_CHAT,
              sid,
              tid: 2,
              ...defaults,
            })
          );
          break;
        case ChatCmd.RECENT_CHAT:
        case ChatCmd.CHAT:
          const isRecent = json.cmd == ChatCmd.RECENT_CHAT;
          const chats: Chat[] = (
            isRecent ? json["bdy"]["messageList"] : json["bdy"]
          )
            .filter(
              (chat: any) =>
                (chat["msgTypeCode"] || chat["messageTypeCode"]) == 1
            )
            .filter(
              (chat: any) =>
                !(
                  (chat["msgStatusType"] || chat["messageStatusType"]) ==
                  "HIDDEN"
                )
            )
            .map(convertChat);

          if (isRecent) {
            pendingChatListRef.current = [];
            setChatList(chats);
          } else {
            pendingChatListRef.current = [
              ...pendingChatListRef.current,
              ...chats,
            ].slice(-1 * maxChatLength);
          }
          break;
      }

      if (json.cmd !== ChatCmd.PONG) {
        worker.postMessage("startPingTimer");
      }
    };

    worker.postMessage("startPingTimer");

    return () => {
      worker.postMessage("stop");
      worker.terminate();
      ws.close();
    };
  }, [accessToken, chatChannelId, convertChat, maxChatLength]);

  useEffect(() => {
    return connectChzzk();
  }, [connectChzzk, webSocketBuster]);

  useEffect(() => {
    window.addEventListener(
      "beforeunload",
      () => (isBrowserUnloadingRef.current = true)
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) {
        return;
      }
      if (pendingChatListRef.current.length > 0) {
        if (new Date().getTime() - lastSetTimestampRef.current > 1000) {
          setChatList((prevChatList) => {
            const newChatList = [
              ...prevChatList,
              ...pendingChatListRef.current,
            ].slice(-1 * maxChatLength);
            pendingChatListRef.current = [];
            return newChatList;
          });
        } else {
          setChatList((prevChatList) => {
            const newChatList = [
              ...prevChatList,
              pendingChatListRef.current.shift(),
            ];
            if (newChatList.length > maxChatLength) {
              newChatList.shift();
            }
            return newChatList;
          });
        }
      }
      lastSetTimestampRef.current = new Date().getTime();
    }, 75);
    return () => {
      clearInterval(interval);
      lastSetTimestampRef.current = 0;
    };
  }, [maxChatLength]);

  return chatList;
}
