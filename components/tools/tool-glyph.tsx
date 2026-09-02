import {
  Binary,
  Braces,
  CaseSensitive,
  Clock3,
  FileSpreadsheet,
  FileImage,
  FileText,
  Fingerprint,
  Files,
  Hash,
  Link as LinkIcon,
  ListOrdered,
  Images,
  Minimize2,
  Palette,
  RotateCw,
  WandSparkles,
  Wrench,
} from "lucide-react";
import type { SVGProps } from "react";

function WordToPdfGlyph({
  width = 24,
  height = 24,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      {...props}
    >
      <rect x="1" y="2" width="14" height="14" rx="2.25" fill="#dce8fb" />
      <path
        d="m4.2 6.2 1.45 5.55h1.5l.95-3.42.95 3.42h1.5L12 6.2h-1.45l-.82 3.68-.98-3.68H7.5l-.98 3.68L5.7 6.2Z"
        fill="#285b9d"
      />
      <rect x="9" y="9" width="14" height="13" rx="2.25" fill="#5c7fc6" />
      <path
        d="M13 14.1 17.9 19m0 0v-3.5m0 3.5h-3.5"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.65"
      />
    </svg>
  );
}

const glyphs = {
  pdf: FileText,
  files: FileText,
  scissors: FileText,
  shrink: Minimize2,
  braces: Braces,
  binary: Binary,
  fingerprint: Fingerprint,
  link: LinkIcon,
  hash: Hash,
  clock: Clock3,
  spreadsheet: FileSpreadsheet,
  "pdf-image": FileImage,
  "image-pdf": Images,
  "word-pdf": WordToPdfGlyph,
  rotate: RotateCw,
  organize: Files,
  "page-numbers": ListOrdered,
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
  return <Icon aria-hidden="true" width={size} height={size} strokeWidth={1.7} />;
}
