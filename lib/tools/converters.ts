export function parseTimestamp(input: string) {
  const value = input.trim();
  const milliseconds = /^\d{1,13}$/.test(value)
    ? Number(value) * (value.length === 10 ? 1000 : 1)
    : Date.parse(value);

  if (!Number.isFinite(milliseconds)) return null;
  const date = new Date(milliseconds);
  return {
    iso: date.toISOString(),
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
  };
}

export function hexToRgb(input: string) {
  let value = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value
      .split("")
      .map((character) => character.repeat(2))
      .join("");
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const [red, green, blue] = [0, 2, 4].map((offset) =>
    Number.parseInt(value.slice(offset, offset + 2), 16),
  );
  return { hex: `#${value.toUpperCase()}`, red, green, blue };
}

export function getTextStats(input: string) {
  return {
    words: input.trim() ? input.trim().split(/\s+/u).length : 0,
    characters: input.length,
    charactersWithoutSpaces: input.replace(/\s/gu, "").length,
    lines: input ? input.split(/\r?\n/u).length : 0,
  };
}

export function toSlug(input: string, locale: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase(locale)
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toTitleCase(input: string, locale: string) {
  return input
    .toLocaleLowerCase(locale)
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase(locale));
}
