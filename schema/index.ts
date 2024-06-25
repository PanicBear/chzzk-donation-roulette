import { z } from "zod";

export const ChannelSearch = z.object({ query: z.string().trim().min(1) });
export type ChannelSearch = z.infer<typeof ChannelSearch>;

export const RouletteOption = z.object({
  option: z
    .object({
      label: z.string().trim().min(1),
      ratio: z.number().nonnegative().int().min(1),
    })
    .array()
    .min(1),
});
export type RouletteOption = z.infer<typeof RouletteOption>;
