import { createElement, type ComponentType, type ReactElement } from "react";
import { ExcelToCsv } from "@/components/tools/excel-to-csv";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { PdfCompress } from "@/components/tools/pdf-compress";
import { PdfMerge } from "@/components/tools/pdf-merge";
import { PdfSplit } from "@/components/tools/pdf-split";
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
import type { Locale } from "@/lib/content/types";

export type ToolWorkspaceProps = Readonly<{
  locale: Locale;
}>;

const toolWorkspaceRegistry = {
  "excel-to-csv": ExcelToCsv,
  "pdf-compress": PdfCompress,
  "pdf-merge": PdfMerge,
  "pdf-split": PdfSplit,
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
} satisfies Record<string, ComponentType<ToolWorkspaceProps>>;

export type RegisteredToolSlug = keyof typeof toolWorkspaceRegistry;

export const registeredToolSlugs = Object.freeze(
  Object.keys(toolWorkspaceRegistry) as RegisteredToolSlug[],
);

export function getToolWorkspace(
  slug: string,
): ComponentType<ToolWorkspaceProps> | null {
  if (!Object.hasOwn(toolWorkspaceRegistry, slug)) return null;

  return toolWorkspaceRegistry[slug as RegisteredToolSlug];
}

export function hasToolWorkspace(slug: string): slug is RegisteredToolSlug {
  return Object.hasOwn(toolWorkspaceRegistry, slug);
}

export function renderToolWorkspace(
  slug: string,
  props: ToolWorkspaceProps,
): ReactElement | null {
  const ToolWorkspace = getToolWorkspace(slug);
  return ToolWorkspace ? createElement(ToolWorkspace, props) : null;
}
