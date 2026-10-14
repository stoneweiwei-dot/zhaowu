/** A rewrite may restate supplied figures, but may not introduce a new one. */
export function hasUnsupportedNumbers(output: string, sources: string[]): boolean {
  const numbers = (text: string) => text.match(/\d+(?:[.,]\d+)?/g) ?? [];
  const allowed = new Set(sources.flatMap(numbers));
  return numbers(output).some((number) => !allowed.has(number));
}

/** Relative years are dates too, even though they contain no digits. */
export function hasUnsupportedRelativeYear(output: string, sources: string[]): boolean {
  const source = sources.join(" ");
  return ["今年", "明年", "後年", "this year", "next year", "the year after next"]
    .some((word) => output.toLowerCase().includes(word) && !source.toLowerCase().includes(word));
}
