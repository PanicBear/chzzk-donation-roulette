export default function rollSlot(f: number): boolean {
  const result = Math.random();

  console.log(result);

  return result < f;
}
