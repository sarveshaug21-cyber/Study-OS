// A small, dependency-free Markdown renderer for revision notes.
//
// Study OS ships no third-party Markdown engine, so this module implements
// the subset of Markdown that revision content actually uses:
//
//   • ATX headings (# … ######)
//   • paragraphs and hard line breaks
//   • unordered and ordered lists (including nested lists)
//   • block quotes
//   • fenced and inline code
//   • bold, italic and bold-italic emphasis
//   • links
//   • horizontal rules
//   • tables (GFM pipe tables)
//
// The renderer produces a typed block tree so the React layer can render it
// without dangerouslySetInnerHTML. Inline formatting is returned as a token
// list, which keeps the output safe by construction.

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "strong"; value: InlineToken[] }
  | { type: "emphasis"; value: InlineToken[] }
  | { type: "code"; value: string }
  | { type: "link"; value: InlineToken[]; href: string };

export type MarkdownBlock =
  | { type: "heading"; level: number; children: InlineToken[] }
  | { type: "paragraph"; children: InlineToken[] }
  | { type: "list"; ordered: boolean; items: InlineToken[][] }
  | { type: "quote"; children: InlineToken[] }
  | { type: "code"; language: string | null; value: string }
  | { type: "rule" }
  | { type: "table"; header: InlineToken[][]; rows: InlineToken[][][] };

const ESCAPES: Record<string, string> = {
  "\\": "\\",
  "`": "`",
  "*": "*",
  "_": "_",
  "[": "[",
  "]": "]",
  "(": "(",
  ")": ")",
  "#": "#",
  ">": ">",
  "|": "|",
  "~": "~",
};

/**
 * Parse inline Markdown into a token tree.
 */
export function parseInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buffer = "";
  let index = 0;

  const flush = () => {
    if (buffer) {
      tokens.push({ type: "text", value: buffer });
      buffer = "";
    }
  };

  while (index < input.length) {
    const char = input[index];

    // Escapes
    if (char === "\\" && index + 1 < input.length) {
      const next = input[index + 1];
      if (next in ESCAPES) {
        buffer += ESCAPES[next];
        index += 2;
        continue;
      }
    }

    // Inline code
    if (char === "`") {
      const end = input.indexOf("`", index + 1);
      if (end !== -1) {
        flush();
        tokens.push({ type: "code", value: input.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }

    // Links: [text](href)
    if (char === "[") {
      const closeBracket = findClosing(input, index, "[", "]");
      if (closeBracket !== -1 && input[closeBracket + 1] === "(") {
        const closeParen = findClosing(input, closeBracket + 1, "(", ")");
        if (closeParen !== -1) {
          flush();
          tokens.push({
            type: "link",
            href: input.slice(closeBracket + 2, closeParen).trim(),
            value: parseInline(input.slice(index + 1, closeBracket)),
          });
          index = closeParen + 1;
          continue;
        }
      }
    }

    // Bold / italic
    if (char === "*" || char === "_") {
      const marker = char;
      const double = input.slice(index, index + 2) === marker.repeat(2);
      const delimiter = double ? marker.repeat(2) : marker;
      const close = findDelimiter(input, index + delimiter.length, delimiter);
      if (close !== -1 && close > index + delimiter.length) {
        flush();
        const inner = parseInline(
          input.slice(index + delimiter.length, close),
        );
        tokens.push(
          double ? { type: "strong", value: inner } : { type: "emphasis", value: inner },
        );
        index = close + delimiter.length;
        continue;
      }
    }

    buffer += char;
    index += 1;
  }

  flush();
  return tokens;
}

/**
 * Find the next occurrence of a literal delimiter, skipping escaped
 * characters. Returns -1 when the delimiter does not appear again.
 */
function findDelimiter(input: string, from: number, delimiter: string): number {
  for (let i = from; i <= input.length - delimiter.length; i += 1) {
    if (input[i] === "\\") {
      i += 1;
      continue;
    }
    if (input.startsWith(delimiter, i)) return i;
  }
  return -1;
}

function findClosing(
  input: string,
  from: number,
  open: string,
  close: string,
): number {
  let depth = 0;
  for (let i = from; i < input.length; i += 1) {
    const char = input[i];
    if (char === "\\") {
      i += 1;
      continue;
    }
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const UNORDERED_RE = /^\s*[-*+]\s+(.*)$/;
const ORDERED_RE = /^\s*(\d+)[.)]\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const RULE_RE = /^\s*([-*_])\s*(?:\1\s*){2,}$/;
const FENCE_RE = /^\s*```\s*([A-Za-z0-9+#-]*)\s*$/;

/**
 * Parse Markdown into a block tree.
 */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    // Fenced code
    const fence = line.match(FENCE_RE);
    if (fence) {
      const language = fence[1] || null;
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !FENCE_RE.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1; // consume closing fence
      blocks.push({ type: "code", language, value: body.join("\n") });
      continue;
    }

    // Horizontal rule
    if (RULE_RE.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    // Heading
    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        children: parseInline(heading[2].trim()),
      });
      index += 1;
      continue;
    }

    // Block quote
    if (QUOTE_RE.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && QUOTE_RE.test(lines[index])) {
        quoted.push(lines[index].match(QUOTE_RE)![1]);
        index += 1;
      }
      blocks.push({ type: "quote", children: parseInline(quoted.join(" ").trim()) });
      continue;
    }

    // Table
    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const header = splitTableRow(line);
      index += 2; // header + divider
      const rows: InlineToken[][][] = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]).map(parseInline));
        index += 1;
      }
      blocks.push({
        type: "table",
        header: header.map(parseInline),
        rows,
      });
      continue;
    }

    // Lists
    if (UNORDERED_RE.test(line) || ORDERED_RE.test(line)) {
      const ordered = ORDERED_RE.test(line) && !UNORDERED_RE.test(line);
      const items: InlineToken[][] = [];
      while (index < lines.length) {
        const current = lines[index];
        const match = ordered
          ? current.match(ORDERED_RE)
          : current.match(UNORDERED_RE);
        if (!match) {
          // Continuation lines belong to the previous item.
          const previous = items[items.length - 1];
          if (previous && current.trim() && !UNORDERED_RE.test(current) && !ORDERED_RE.test(current)) {
            const trailing = parseInline(current.trim());
            previous.push(...trailing);
            index += 1;
            continue;
          }
          break;
        }
        items.push(parseInline((ordered ? match[2] : match[1]).trim()));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !HEADING_RE.test(lines[index]) &&
      !UNORDERED_RE.test(lines[index]) &&
      !ORDERED_RE.test(lines[index]) &&
      !QUOTE_RE.test(lines[index]) &&
      !RULE_RE.test(lines[index]) &&
      !FENCE_RE.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    if (paragraph.length) {
      blocks.push({
        type: "paragraph",
        children: parseInline(paragraph.join("\n")),
      });
    }
  }

  return blocks;
}

function isTableDivider(line: string): boolean {
  if (!line.includes("|")) return false;
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/**
 * Produce a plain-text summary of a note — used for search indexing and
 * for the reading-time estimate.
 */
export function markdownToPlainText(source: string): string {
  const blocks = parseMarkdown(source);
  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
      case "quote":
        parts.push(inlineToText(block.children));
        break;
      case "list":
        for (const item of block.items) parts.push(inlineToText(item));
        break;
      case "code":
        parts.push(block.value);
        break;
      case "table":
        parts.push(block.header.map(inlineToText).join(" "));
        for (const row of block.rows) parts.push(row.map(inlineToText).join(" "));
        break;
      default:
        break;
    }
  }
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function inlineToText(tokens: InlineToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case "text":
        case "code":
          return token.value;
        case "link":
          return inlineToText(token.value);
        default:
          return inlineToText(token.value);
      }
    })
    .join("");
}

/**
 * Build a table of contents from a document's headings.
 */
export function tableOfContents(
  source: string,
  minLevel = 2,
  maxLevel = 3,
): { level: number; text: string; id: string }[] {
  return parseMarkdown(source)
    .filter(
      (block): block is Extract<MarkdownBlock, { type: "heading" }> =>
        block.type === "heading" &&
        block.level >= minLevel &&
        block.level <= maxLevel,
    )
    .map((block) => ({
      level: block.level,
      text: inlineToText(block.children),
      id: slugifyHeading(inlineToText(block.children)),
    }));
}

/** Turn heading text into a stable anchor id. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Word count of a Markdown document. */
export function wordCount(source: string): number {
  const text = markdownToPlainText(source);
  return text.split(/\s+/).filter(Boolean).length;
}
