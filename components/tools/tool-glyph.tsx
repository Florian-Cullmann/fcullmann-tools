import { Binary, Braces, Fingerprint, Link as LinkIcon, Wrench } from "lucide-react";

const glyphs = {
  braces: Braces,
  binary: Binary,
  fingerprint: Fingerprint,
  link: LinkIcon
};

export function ToolGlyph({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = glyphs[name as keyof typeof glyphs] ?? Wrench;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.7} />;
}
