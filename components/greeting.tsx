import { Channel } from "chzzk";
import Link from "next/link";
import { memo } from "react";
import { twMerge } from "tailwind-merge";
import Button from "./button";

const Greeting = ({ channel }: { channel?: Channel | null }) => {
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
};

export default memo(Greeting);
