import { Channel } from 'chzzk';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo } from 'react';
import useSWR from 'swr';
import { twMerge } from 'tailwind-merge';

const Greeting = memo(({ channel }: { channel?: Channel | null }) => {
  if (channel === null) return <span>채널 정보를 찾을 수 없습니다.</span>;
  if (!channel) return <></>;

  return <span className={twMerge('p-4')}>{`${channel.channelName}님 안녕하세요!`}</span>;
});

export default function Page() {
  const router = useRouter();

  const channelId = router.query.channelId;

  const { data } = useSWR<Channel | null>(channelId ? `/api/channel/${channelId}` : '', {
    onSuccess(data) {
      console.log(data);
    }
  });

  return (
    <>
      <Greeting channel={data} />
      <section className={twMerge('p-4')}>
        <Link href={`/${channelId}/option`} passHref>
          <button
            className={twMerge(
              'w-fit h-10',
              'p-2',
              'flex items-center',
              'border-2 border-solid border-black rounded-md',
              'hover:bg-blue-400 hover:text-white'
            )}
          >
            룰렛 옵션 설정
          </button>
        </Link>
      </section>
    </>
  );
}

Greeting.displayName = 'Greeting';
