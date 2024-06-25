import { z } from "zod";

export const ChannelSearch = z.object({ query: z.string().trim().min(1) });

export type ChannelSearch = z.infer<typeof ChannelSearch>;
