import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function CNavBar() {
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
    </nav>
  );
}
