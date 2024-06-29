export default function filterMsg(text?: string) {
  return (text ?? "").replace(/(?:\r\n|\r|\n|,)/g, " ");
}
