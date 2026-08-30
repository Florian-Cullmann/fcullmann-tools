import {
  Binary,
  Braces,
  CaseSensitive,
  Clock3,
  Files,
  Fingerprint,
  Hash,
  Link as LinkIcon,
  ListOrdered,
  Palette,
  Scissors,
  WandSparkles,
  Wrench,
} from "lucide-react";

const glyphs = {
  files: Files,
  scissors: Scissors,
  braces: Braces,
  binary: Binary,
  fingerprint: Fingerprint,
  link: LinkIcon,
  hash: Hash,
  clock: Clock3,
  case: CaseSensitive,
  palette: Palette,
  list: ListOrdered,
  wand: WandSparkles,
};

export function ToolGlyph({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  const Icon = glyphs[name as keyof typeof glyphs] ?? Wrench;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.7} />;
}
