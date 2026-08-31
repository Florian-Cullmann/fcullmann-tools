import { createElement, type ComponentType, type ReactElement } from "react";
import { ExcelToCsv } from "@/components/tools/excel-to-csv";
import { JpgToPdf } from "@/components/tools/jpg-to-pdf";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { PdfCompress } from "@/components/tools/pdf-compress";
import { PdfMerge } from "@/components/tools/pdf-merge";
import { PdfSplit } from "@/components/tools/pdf-split";
import { PdfToJpg } from "@/components/tools/pdf-to-jpg";
import { WordToPdf } from "@/components/tools/word-to-pdf";
import {
  Base64Tool,
  CaseConverterTool,
  ColorConverterTool,
  HashGeneratorTool,
  SlugGeneratorTool,
  TimestampConverterTool,
  UrlCodecTool,
  UuidTool,
  WordCounterTool,
} from "@/components/tools/simple-tools";
import type { Locale } from "@/lib/i18n/types";
import {
  implementedToolSlugs,
  isImplementedToolSlug,
  type ToolSlug,
} from "@/lib/tools/manifest";

export type ToolWorkspaceProps = Readonly<{
  locale: Locale;
}>;

const toolWorkspaceRegistry = {
  "excel-to-csv": ExcelToCsv,
  "word-to-pdf": WordToPdf,
  "pdf-compress": PdfCompress,
  "pdf-merge": PdfMerge,
  "pdf-split": PdfSplit,
  "pdf-to-jpg": PdfToJpg,
  "jpg-to-pdf": JpgToPdf,
  "json-formatter": JsonFormatter,
  base64: Base64Tool,
  "uuid-generator": UuidTool,
  "url-encoder": UrlCodecTool,
  "hash-generator": HashGeneratorTool,
  "timestamp-converter": TimestampConverterTool,
  "case-converter": CaseConverterTool,
  "color-converter": ColorConverterTool,
  "word-counter": WordCounterTool,
  "slug-generator": SlugGeneratorTool,
} satisfies Record<ToolSlug, ComponentType<ToolWorkspaceProps>>;

export type RegisteredToolSlug = ToolSlug;

export const registeredToolSlugs = implementedToolSlugs;

export function getToolWorkspace(
  slug: string,
): ComponentType<ToolWorkspaceProps> | null {
  if (!isImplementedToolSlug(slug)) return null;

  return toolWorkspaceRegistry[slug];
}

export function hasToolWorkspace(slug: string): slug is RegisteredToolSlug {
  return isImplementedToolSlug(slug);
}

export function renderToolWorkspace(
  slug: string,
  props: ToolWorkspaceProps,
): ReactElement | null {
  const ToolWorkspace = getToolWorkspace(slug);
  return ToolWorkspace ? createElement(ToolWorkspace, props) : null;
}
