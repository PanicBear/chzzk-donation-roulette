export enum ChatCmd {
  PING = 0,
  PONG = 10000,
  CONNECT = 100,
  CONNECTED = 10100,
  REQUEST_RECENT_CHAT = 5101,
  RECENT_CHAT = 15101,
  CHAT = 93101,
}

export const ROLL_PERCENTAGE = 0.01;

export const EMOJI_REGEX = /{:([a-zA-Z0-9_]+):}/g;

export const OPTION_MIN_LENGTH = 2;

export const OPTION_DEFAULT = [
  { label: "당첨", ratio: 1 },
  { label: "꽝", ratio: 99 },
];
