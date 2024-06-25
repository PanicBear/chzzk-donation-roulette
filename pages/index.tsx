import { ChannelSearch } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Channel, ChannelSearchResult } from "chzzk";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";

const SearchResult = memo(({ channels = [] }: { channels?: Channel[] }) => {
  if (!channels.length) return <></>;

  return (
    <section className={twMerge("p-4", "space-y-2")}>
      <span>{`검색결과: ${channels.length}`}</span>
      <ul>
        {channels.map((channel, index) => {
          return (
            <Link
              key={`channel-search-${index}`}
              href={`/${channel.channelId}`}
              passHref
            >
              <li
                className={twMerge(
                  "w-96 h-10",
                  "p-2",
                  "flex justify-between items-center gap-4",
                  "rounded-sm",
                  "hover:bg-blue-300"
                )}
              >
                {channel.channelImageUrl ? (
                  <Image
                    className={twMerge("rounded-full")}
                    width={36}
                    height={36}
                    src={channel.channelImageUrl}
                    alt={`channel-search-channel-image`}
                  />
                ) : (
                  <div
                    className={twMerge(
                      "w-[36px] h-[36px]",
                      "bg-gray-300",
                      "rounded-full"
                    )}
                  />
                )}

                <span className={twMerge("flex-1", "flex items-center")}>
                  {channel.channelName}
                  {channel.verifiedMark && (
                    <div className={twMerge("inline", "p-1.5 mb-0.5")}>
                      <Image
                        className={twMerge("inline")}
                        width={16}
                        height={16}
                        src={
                          "https://ssl.pstatic.net/static/nng/glive/resource/p/static/media/icon_official.a53d1555f8f4796d7862.png"
                        }
                        alt={`channel-search-partner`}
                      />
                    </div>
                  )}
                </span>
                <button type="button">선택</button>
              </li>
            </Link>
          );
        })}
      </ul>
    </section>
  );
});

export default function Page() {
  const methods = useForm<ChannelSearch>({
    resolver: zodResolver(ChannelSearch),
    defaultValues: {
      query: "이글콥",
    },
  });

  const channelName = methods.watch("query");

  const { data } = useSWR<ChannelSearchResult>(
    channelName ? `/api/search/channels/${channelName}` : "",
    {
      onSuccess(data) {
        console.log(data);
      },
    }
  );

  const handleValidForm = useCallback(
    async ({ query }: ChannelSearch) => {
      methods.setValue("query", query);
    },
    [methods]
  );

  return (
    <>
      <form
        className={twMerge(
          "p-4",
          "flex flex-row justify-start items-center gap-4"
        )}
        onSubmit={methods.handleSubmit(handleValidForm)}
      >
        <input
          {...methods.register("query")}
          className={twMerge(
            "w-80 h-10",
            "p-2",
            "border-2 border-solid border-black rounded-md"
          )}
          required
          placeholder="채널명을 입력해주세요 ex) 이글콥, 서새봄"
        />
        <button
          className={twMerge(
            "w-fit h-10",
            "p-2",
            "flex items-center",
            "border-2 border-solid border-black rounded-md",
            "hover:bg-blue-400 hover:text-white"
          )}
        >
          채널 검색
        </button>
      </form>
      <SearchResult channels={data?.channels} />
    </>
  );
}

SearchResult.displayName = "SearchResult";
