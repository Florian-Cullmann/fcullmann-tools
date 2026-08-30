import {
  Binary,
  Braces,
  CaseSensitive,
  Clock3,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Hash,
  Link as LinkIcon,
  ListOrdered,
  Palette,
  WandSparkles,
  Wrench,
} from "lucide-react";

const glyphs = {
  pdf: FileText,
  files: FileText,
  scissors: FileText,
  braces: Braces,
  binary: Binary,
  fingerprint: Fingerprint,
  link: LinkIcon,
  hash: Hash,
  clock: Clock3,
  spreadsheet: FileSpreadsheet,
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
