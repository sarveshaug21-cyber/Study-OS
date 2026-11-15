// Pure helpers for turning stored note content into readable structure.
// Kept free of React and server imports so they can be unit-tested.

import { markdownToPlainText } from "@/lib/markdown";

export type NoteSection = {
  heading: string;
  body: string;
};

export type NoteSectionBlock = {
  type: "heading" | "paragraph" | "list" | "quote";
  level?: number;
  text: string;
  items?: string[];
};

/**
 * Split Markdown-ish content into sections keyed by ATX headings.
 */
export function parseSections(content: string): NoteSection[] {
  const lines = content.split("\n");
  const sections: NoteSection[] = [];
  let current: { heading: string; body: string[] } | null = null;
  const flush = () => {
    if (current) {
      sections.push({
        heading: current.heading,
        body: current.body.join("\n").trim(),
      });
      current = null;
    }
  };
  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.+)$/);
    if (m) {
      flush();
      current = { heading: m[2].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  flush();
  if (sections.length === 0 && content.trim()) {
    sections.push({ heading: "Overview", body: content.trim() });
  }
  return sections;
}

/** Rough reading time at 200 words per minute, minimum one minute. */
export function readingMinutes(content: string): number {
  const text = markdownToPlainText(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Parse a body into ordered blocks: paragraphs, bullet lists and block quotes.
 */
export function parseBlocks(body: string): NoteSectionBlock[] {
  const blocks: NoteSectionBlock[] = [];
  const chunks = body.split(/\n{2,}/);

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    if (lines.every((line) => /^\s*[-*]\s+/.test(line) || !line.trim())) {
      blocks.push({
        type: "list",
        text: "",
        items: lines
          .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
          .filter(Boolean),
      });
      continue;
    }

    if (lines.every((line) => /^\s*>\s?/.test(line) || !line.trim())) {
      blocks.push({
        type: "quote",
        text: lines
          .map((line) => line.replace(/^\s*>\s?/, "").trim())
          .filter(Boolean)
          .join(" "),
      });
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].trim(),
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: trimmed.replace(/\n/g, " ") });
  }

  return blocks;
}

/** Estimate how many key terms a note highlights (bold spans). */
export function countKeyTerms(content: string): number {
  const matches = content.match(/\*\*[^*\n]+\*\*/g);
  return matches ? matches.length : 0;
}

export type NoteSectionLike = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type KeyTermLike = { term: string; definition: string };

/**
 * Render structured note data as Markdown so that demo notes and
 * user-authored notes travel through exactly the same renderer.
 */
export function noteToMarkdown(
  sections: readonly NoteSectionLike[],
  keyTerms: readonly KeyTermLike[] = [],
): string {
  const parts: string[] = [];

  for (const section of sections) {
    parts.push(`## ${section.heading}`);
    parts.push(section.body.trim());
    if (section.bullets?.length) {
      parts.push(section.bullets.map((bullet) => `- ${bullet.trim()}`).join("\n"));
    }
    parts.push("");
  }

  if (keyTerms.length) {
    parts.push("## Key terms");
    for (const term of keyTerms) {
      parts.push(`- **${term.term}** — ${term.definition}`);
    }
    parts.push("");
  }

  return parts.join("\n").trim();
}
