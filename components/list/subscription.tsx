import { List } from "@/types";
import { Events } from "chzzk";
import { format, toDate } from "date-fns";
import { memo, useEffect, useMemo } from "react";
import { useController } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import Button from "../button";
import exportToCSV from "@/utils/csvDownload";
import filterMsg from "@/utils/filterMsg";

const SubscriptionList = ({
  list = [],
  control,
}: List<Events["subscription"]>) => {
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
        .map((sub, index) => {
          const nickname = sub.profile?.nickname ?? "익명";
          const date = format(toDate(sub.time), "yyyy/MM/dd HH:mm:ss");
          const message = filterMsg(sub.message);
          const tierName = sub.extras.tierName;
          const month = sub.extras.month;

          return { index, nickname, date, message, tierName, month };
        }),
    [filter, list]
  );

  if (type !== "subscription") return <></>;

  return (
    <div className={twMerge("space-y-4")}>
      <div className={twMerge("flex justify-start items-center gap-4")}>
        <Button
          onClick={() => {
            console.log(filteredList);
            exportToCSV({ filename: "test", rows: filteredList, filter: {} });
          }}
        >
          현재 목록 다운로드
        </Button>
      </div>
      <div className={twMerge("flex justify-start items-center gap-4")}>
        <span className={twMerge("w-8")}>순서</span>
        <span className={twMerge("w-36")}>닉네임</span>
        <span className={twMerge("w-20")}>구독 종류</span>
        <span className={twMerge("w-24")}>구독 개월 수</span>
        <span className={twMerge("w-44")}>날짜</span>
        <span>메시지</span>
      </div>
      <ul
        className={twMerge(
          "flex flex-col-reverse justify-start items-start gap-4"
        )}
      >
        {filteredList.map((sub) => {
          const { index, nickname, date, message, tierName, month } = sub;

          return (
            <li
              key={index}
              className={twMerge("flex justify-start items-start gap-4")}
            >
              <span className={twMerge("w-8", "flex-shrink-0")}>{index}</span>
              <span className={twMerge("w-36", "flex-shrink-0")}>
                {nickname}
              </span>
              <span className={twMerge("w-20", "flex-shrink-0")}>
                {tierName}
              </span>
              <span className={twMerge("w-24", "flex-shrink-0")}>{month}</span>
              <span className={twMerge("w-44", "flex-shrink-0")}>{date}</span>
              <span>{message}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default memo(SubscriptionList);
