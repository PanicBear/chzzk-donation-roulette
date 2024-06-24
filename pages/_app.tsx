import CNavBar from "@/components/navbar";
import "@/styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import { twMerge } from "tailwind-merge";

import "../styles/donation.css";

import { Nanum_Gothic } from "next/font/google";

const nanumGothic = Nanum_Gothic({ weight: "700", subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => axios.get(url).then(({ data }) => data),

        errorRetryCount: 3,
        errorRetryInterval: 2500,
      }}
    >
      <main className={twMerge("w-screen h-screen", nanumGothic.className)}>
        <CNavBar />
        <Component {...pageProps} />
      </main>
    </SWRConfig>
  );
}
