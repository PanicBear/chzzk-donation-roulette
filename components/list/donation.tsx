import { List } from "@/types";
import exportToCSV from "@/utils/csvDownload";
import { Events, donationTypeName } from "chzzk";
import { format, toDate } from "date-fns";
import { memo, useMemo } from "react";
import { useController } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import Button from "@/components/button";
import filterMsg from "@/utils/filterMsg";

const DonationList = ({ list = [], control }: List<Events["donation"]>) => {
  const {
    field: { value: type },
  } = useController({ control, name: "type" });

  const {
    field: { value: filter },
  } = useController({ control, name: "filter" });

  const {
    field: { value: amount },
  } = useController({ control, name: "amount" });

  const {
    field: { value: donationType },
  } = useController({ control, name: "donationType" });

  const filteredList = useMemo(
    () =>
      list
        .filter((el) => {
          try {
            if (filter.trim() && el.message.includes(filter.trim()))
              throw new Error("invalid donation type");

            if (Number(amount) && el.extras.payAmount !== Number(amount))
              throw new Error("donation amount not matched");

            if (donationType && el.extras.donationType !== donationType)
              throw new Error("donation type not matched");
          } catch (error) {
            return false;
          }

          return true;
        })
        .sort((el) => el.time)
        .map((donation, index) => {
          const nickname = donation.profile?.nickname ?? "익명";
          const payAmount = donation.extras.payAmount.toLocaleString("en-US");

          const donationType = donationTypeName(donation.extras.donationType);
          const date = format(toDate(donation.time), "yyyy/MM/dd HH:mm:ss");
          const message = filterMsg(donation.message);

          return { index, nickname, donationType, payAmount, date, message };
        }),
    [amount, donationType, filter, list]
  );

  if (type !== "donation") return <></>;

  return (
    <div className={twMerge("space-y-4")}>
      <div className={twMerge("flex justify-start items-center gap-4")}>
        <Button
          onClick={() => {
            exportToCSV({ filename: "test", rows: filteredList, filter: {} });
          }}
        >
          현재 목록 다운로드
        </Button>
      </div>
      <div className={twMerge("flex justify-start items-center gap-4")}>
        <span className={twMerge("w-8")}>순서</span>
        <span className={twMerge("w-36")}>닉네임</span>
        <span className={twMerge("w-20")}>후원종류</span>
        <span className={twMerge("w-20")}>후원액</span>
        <span className={twMerge("w-44")}>날짜</span>
        <span>메시지</span>
      </div>
      <ul
        className={twMerge(
          "flex flex-col-reverse justify-start items-start gap-4"
        )}
      >
        {filteredList.map((item) => {
          const { index, nickname, donationType, payAmount, date, message } =
            item;

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
                {donationType}
              </span>
              <span className={twMerge("w-20", "flex-shrink-0")}>
                {payAmount}
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

export default memo(DonationList);
