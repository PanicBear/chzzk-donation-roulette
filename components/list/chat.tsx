import { List } from "@/types";
import { Events } from "chzzk";
import { format, toDate } from "date-fns";
import { memo } from "react";
import { useController } from "react-hook-form";
import { twMerge } from "tailwind-merge";

const ChatList = ({ list = [], control }: List<Events["chat"]>) => {
  const {
    field: { value: type },
  } = useController({ control, name: "type" });

  const {
    field: { value: filter },
  } = useController({ control, name: "filter" });

  if (type !== "chat") return <></>;

  return (
    <div className={twMerge("space-y-4")}>
      <div className={twMerge("flex justify-start items-center gap-4")}>
        <span className={twMerge("w-8")}>순서</span>
        <span className={twMerge("w-36")}>닉네임</span>
        <span className={twMerge("w-44")}>날짜</span>
        <span>메시지</span>
      </div>
      <ul
        className={twMerge(
          "flex flex-col-reverse justify-start items-start gap-4"
        )}
      >
        {list
          .filter((el) => el.message.includes(filter.trim()))
          .map((chat, index) => {
            const { profile, message, time } = chat;

            return (
              <li
                key={index}
                className={twMerge("flex justify-start items-start gap-4")}
              >
                <span className={twMerge("w-8", "flex-shrink-0")}>{index}</span>
                <span className={twMerge("w-36", "flex-shrink-0")}>
                  {profile.nickname}
                </span>
                <span className={twMerge("w-44", "flex-shrink-0")}>
                  {format(toDate(time), "yyyy/MM/dd HH:mm:ss")}
                </span>
                <span>{message}</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default memo(ChatList);
