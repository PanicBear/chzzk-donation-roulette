import { Option } from "@/types";
import { sumBy } from "lodash";

export default function rollRoulette(options: Option[]) {
  const total = sumBy(options, "ratio");

  const result = Math.random();

  console.log(result);

  let sum = 0;
  let selectedIndex = options.length - 1;

  options.some(({ ratio }, index) => {
    sum += ratio;

    const isSelected = result < sum / total;

    selectedIndex = index;

    return isSelected;
  });

  return selectedIndex;
}
