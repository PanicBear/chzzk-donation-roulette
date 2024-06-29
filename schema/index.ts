import { z } from "zod";

export const ChannelSearch = z.object({ query: z.string().trim().min(1) });
export type ChannelSearch = z.infer<typeof ChannelSearch>;

export const RouletteOption = z.object({
  option: z
    .object({
      label: z.string().trim().min(1),
      ratio: z.coerce.number().nonnegative().int().min(1),
    })
    .array()
    .min(1),
});
export type RouletteOption = z.infer<typeof RouletteOption>;

export const DonationOption = z.object({
  option: z
    .object({
      roulette: z.boolean(),
      rouletteOption: z
        .object({
          label: z.string().trim().min(1),
          ratio: z.coerce.number().nonnegative().int().min(1),
        })
        .passthrough()
        .array()
        .optional(),
      label: z.string().trim(),
      trigger: z.string().trim(),
      amount: z.coerce.number().nonnegative().int().min(1),
    })
    .array()
    .min(1),
  dummyDonation: z
    .object({
      nickname: z.string().trim().optional(),
      message: z.string().trim().optional(),
      amount: z.coerce.number().nonnegative().int().min(1).optional(),
    })
    .optional(),
});
export type DonationOption = z.infer<typeof DonationOption>;

export const LogOption = z.object({
  type: z.string(),
  filter: z.string(),
  amount: z.coerce.number().int().nonnegative(),
  donationType: z.string(),
});
export type LogOption = z.infer<typeof LogOption>;
