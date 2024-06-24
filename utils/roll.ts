export default function roll(f: number): boolean {
  const result = Math.random();

  console.log(result);

  return result < f;
}
