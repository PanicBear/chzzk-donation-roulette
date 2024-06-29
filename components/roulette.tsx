import { forwardRef } from "react";
import SlotCounter from "react-slot-counter";
import { SlotCounterRef, Value } from "react-slot-counter/lib/types/common";

interface RouletteProps {
  value: Value;
  duration?: number;
}

const Roulette = forwardRef<SlotCounterRef, RouletteProps>(
  ({ value, duration }, ref) => {
    return (
      <SlotCounter
        ref={ref}
        startValue={"결과는?"}
        startValueOnce
        value={value}
        animateUnchanged
        direction="bottom-up"
        autoAnimationStart={false}
        duration={duration}
        charClassName="char"
      />
    );
  }
);

Roulette.displayName = "Roulette";

export default Roulette;
