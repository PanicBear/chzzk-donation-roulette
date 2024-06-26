import { List } from "@/types";
import { Events } from "chzzk";
import { format, toDate } from "date-fns";
import { memo, useEffect, useMemo } from "react";
import { useController } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import Button from "../button";
import exportToCSV from "@/utils/csvDownload";
import filterMsg from "@/utils/filterMsg";

const ChatList = ({ list = [], control }: List<Events["chat"]>) => {
  const {
    field: { value: type },
  } = useController({ control, name: "type" });

  const {
    field: { value: filter },
  } = useController({ control, name: "filter" });

  const filteredList = useMemo(
    () =>
      list
        .filter((el) => {
          try {
            if (filter.trim() && el.message.includes(filter.trim()))
              throw new Error("invalid donation type");
          } catch (error) {
            return false;
          }

          return true;
        })
        .sort((el) => el.time)
        .map((chat, index) => {
          const nickname = chat.profile?.nickname ?? "익명";
          const date = format(toDate(chat.time), "yyyy/MM/dd HH:mm:ss");
          const message = filterMsg(chat.message);

          return { index, nickname, date, message };
        }),
    [filter, list]
  );

  if (type !== "chat") return <></>;

  return (
    <div className={twMerge("space-y-4")}>
      <div className={twMerge("flex justify-start items-center gap-4")}>
        <Button
          onClick={() => {
            exportToCSV({
              filename: `채팅_${format(
                new Date(),
                "yyyy년MM월dd일 HH시mm분ss초"
              )}`,
              rows: filteredList,
              filter: {},
            });
          }}
        >
          현재 목록 다운로드
        </Button>
      </div>
      <div className={twMerge("flex justify-start items-center gap-4")}>
        <span className={twMerge("w-10")}>순서</span>
        <span className={twMerge("w-36")}>닉네임</span>
        <span className={twMerge("w-44")}>날짜</span>
        <span>메시지</span>
      </div>
      <ul
        className={twMerge(
          "flex flex-col-reverse justify-start items-start gap-4"
        )}
      >
        {filteredList.map((chat, key) => {
          const { nickname, message, date, index } = chat;

          return (
            <li
              key={key}
              className={twMerge("flex justify-start items-start gap-4")}
            >
              <span className={twMerge("w-10", "flex-shrink-0")}>{index}</span>
              <span className={twMerge("w-36", "flex-shrink-0")}>
                {nickname}
              </span>
              <span className={twMerge("w-44", "flex-shrink-0")}>{date}</span>
              <span>{message}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default memo(ChatList);
