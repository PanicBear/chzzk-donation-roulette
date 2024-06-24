import { memo, useRef } from "react";
import SlotCounter, { SlotCounterRef } from "react-slot-counter";
import { twMerge } from "tailwind-merge";

const CWin = memo(() => (
  <span className={twMerge("px-0.5", "text-3xl")}>축하합니다</span>
));
const CLose = memo(() => (
  <span className={twMerge("px-0.5", "text-3xl")}>다음기회에</span>
));

const Slot = ({ won }: { won: boolean }) => {
  const counterRef = useRef<SlotCounterRef>(null);

  return (
    <SlotCounter
      ref={counterRef}
      value={[won ? <CWin /> : <CLose />]}
      dummyCharacters={[
        <CWin key="start-value-0" />,
        <CLose key="start-value-1" />,
        <CLose key="start-value-2" />,
        <CLose key="start-value-3" />,
      ]}
      // useMonospaceWidth
      duration={1.5}
      dummyCharacterCount={8}
      direction="top-down"
    />
  );
};

CWin.displayName = "Win";
CLose.displayName = "Lose";

export default Slot;
