import { EMOJI_REGEX } from "@/constants";
import { nicknameColors } from "@/hooks/useChatList";
import { Chat } from "@/types";
import Image from "next/image";
import { Fragment, memo } from "react";
import { twMerge } from "tailwind-merge";

const ChatRow = (props: Chat) => {
  const { nickname, badges, color, emojis, message } = props;
  const match = message.match(EMOJI_REGEX);

  return (
    <div
      className={twMerge("flex justify-start items-center gap-2")}
      data-from={nickname}
    >
      <span
        className={twMerge("flex justify-start items-center")}
        style={{
          color: typeof color == "number" ? nicknameColors[color] : color,
        }}
      >
        {badges.map((src, i) => (
          <Image
            key={i}
            width={18}
            height={18}
            className={twMerge("inline", "mr-1")}
            alt=""
            src={src}
          />
        ))}
        <span className="name">{nickname}</span>
        <span className="colon">:</span>
      </span>
      <span className={twMerge("flex justify-start items-center")}>
        {match
          ? message.split(EMOJI_REGEX).map((part, i) => (
              <Fragment key={i}>
                {i % 2 == 0 ? (
                  part
                ) : (
                  <span>
                    <Image
                      width={24}
                      height={24}
                      alt={`{:${part}:}`}
                      src={emojis[part]}
                    />
                  </span>
                )}
              </Fragment>
            ))
          : message}
      </span>
    </div>
  );
};

export default memo(ChatRow);
