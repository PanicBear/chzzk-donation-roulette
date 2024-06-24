import Link from "next/link";
import { useRouter } from "next/router";
import { memo } from "react";
import { twMerge } from "tailwind-merge";

function CNavBar() {
  const router = useRouter();

  if (router.pathname.includes("overlay")) {
    return <></>;
  }

  return (
    <nav
      className={twMerge(
        "mb-4",
        "flex flex-row justify-start items-center gap-2"
      )}
    >
      <Link href="/" passHref>
        /home
      </Link>
      <Link href="/channelSearchResult" passHref>
        /channelSearchResult
      </Link>
      <Link href="/liveDetail" passHref>
        /liveDetail
      </Link>
      <Link href="/chat" passHref>
        /chat
      </Link>
      <Link href="/roulette" passHref>
        /roulette
      </Link>
      <Link href="/roulette/overlay" passHref>
        /roulette/overlay
      </Link>
    </nav>
  );
}

export default memo(CNavBar);
