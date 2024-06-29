import { LogOption } from "@/schema";
import { Events } from "chzzk";
import { Control } from "react-hook-form";

export interface Chat {
  uid: string;
  time: number;
  nickname: string;
  badges: string[];
  color: number | string;
  emojis: Record<string, string>;
  message: string;
}

export type Option = { label: string; ratio: number };

export interface List<T extends Events[keyof Events]> {
  list?: T[];
  control: Control<LogOption, any>;
}
