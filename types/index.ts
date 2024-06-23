export interface Chat {
  uid: string;
  time: number;
  nickname: string;
  badges: string[];
  color: number | string;
  emojis: Record<string, string>;
  message: string;
}
