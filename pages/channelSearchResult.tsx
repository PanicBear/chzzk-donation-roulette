import CNavBar from "@/components/navbar";
import { client } from "@/libs";
import { ChannelSearchResult } from "chzzk";
import { toPairs } from "lodash";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { twMerge } from "tailwind-merge";

export default function Page({
  result,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <section>
      <ul className={twMerge("flex flex-col gap-4")}>
        {result.channels.map((channel, index) => {
          return (
            <li key={index} className={twMerge("flex flex-col gap-4")}>
              {toPairs(channel).map(([k, v], indexChild) => {
                return (
                  <div key={indexChild} className={twMerge("flex  gap-2")}>
                    <span className={twMerge("min-w-36")}>{k}</span>
                    <span className={twMerge("break-all")}>
                      {JSON.stringify(v)}
                    </span>
                  </div>
                );
              })}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export const getServerSideProps = (async () => {
  const result = await client.search.channels("이글콥");

  return { props: { result } };
}) satisfies GetServerSideProps<{ result: ChannelSearchResult }>;
