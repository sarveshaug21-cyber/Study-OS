import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inlineToText,
  markdownToPlainText,
  parseInline,
  parseMarkdown,
  slugifyHeading,
  tableOfContents,
  wordCount,
} from "../lib/markdown";
import {
  countKeyTerms,
  noteToMarkdown,
  parseSections,
  readingMinutes,
} from "../lib/note-content";

test("headings are parsed with their level", () => {
  const blocks = parseMarkdown("# Title\n\nBody text\n\n## Section");
  assert.equal(blocks[0].type, "heading");
  assert.equal(blocks[0].type === "heading" && blocks[0].level, 1);
  assert.equal(blocks[1].type, "paragraph");
  assert.equal(blocks[2].type === "heading" && blocks[2].level, 2);
});

test("paragraphs preserve soft line breaks", () => {
  const blocks = parseMarkdown("First line\nsecond line");
  assert.equal(blocks.length, 1);
  const paragraph = blocks[0];
  assert.equal(paragraph.type, "paragraph");
  if (paragraph.type !== "paragraph") throw new Error("expected paragraph");
  assert.equal(inlineToText(paragraph.children), "First line\nsecond line");
});

test("unordered and ordered lists are distinguished", () => {
  const blocks = parseMarkdown("- one\n- two\n\n1. first\n2. second");
  const list1 = blocks[0];
  const list2 = blocks[1];
  assert.equal(list1.type === "list", true, "first block is a list");
  assert.equal(list1.type === "list" && list1.ordered, false, "first is unordered");
  assert.equal(list2.type === "list", true, "second block is a list");
  assert.equal(list2.type === "list" && list2.ordered, true, "second is ordered");
});

test("block quotes are collected", () => {
  const blocks = parseMarkdown("> quoted line\n> second line");
  assert.equal(blocks[0].type, "quote");
  assert.equal(inlineToText(blocks[0].children), "quoted line second line");
});

test("fenced code blocks keep their body and language", () => {
  const blocks = parseMarkdown("```ts\nconst a = 1;\n```");
  assert.equal(blocks[0].type, "code");
  assert.equal(blocks[0].type === "code" && blocks[0].language, "ts");
  assert.equal(blocks[0].type === "code" && blocks[0].value, "const a = 1;");
});

test("horizontal rules are recognised", () => {
  const blocks = parseMarkdown("a\n\n---\n\nb");
  assert.equal(blocks[1].type, "rule");
});

test("emphasis, strong and code are parsed inline", () => {
  const tokens = parseInline("**bold** and *italic* and `code`");
  assert.equal(tokens[0].type, "strong");
  assert.equal(tokens.find((t) => t.type === "emphasis")?.type, "emphasis");
  assert.equal(tokens.find((t) => t.type === "code")?.type, "code");
  assert.equal(inlineToText(tokens), "bold and italic and code");
});

test("links carry their href and text", () => {
  const tokens = parseInline("see [the spec](https://example.com/aqa)");
  const link = tokens.find((token) => token.type === "link");
  assert.ok(link);
  assert.equal(link.type === "link" && link.href, "https://example.com/aqa");
  assert.equal(inlineToText(link.type === "link" ? link.value : []), "the spec");
});

test("escaped characters are literal", () => {
  assert.equal(inlineToText(parseInline("2 \\* 3 = 6")), "2 * 3 = 6");
});

test("GFM tables are parsed into a header and rows", () => {
  const blocks = parseMarkdown(
    "| Term | Meaning |\n| --- | --- |\n| Fick | law |",
  );
  assert.equal(blocks[0].type, "table");
  if (blocks[0].type === "table") {
    assert.equal(blocks[0].header.length, 2);
    assert.equal(blocks[0].rows.length, 1);
    assert.equal(inlineToText(blocks[0].rows[0][0]), "Fick");
  }
});

test("plain text conversion strips markup", () => {
  const text = markdownToPlainText("# Title\n\nSome **bold** text.\n\n- bullet");
  assert.match(text, /Title/);
  assert.match(text, /Some bold text\./);
  assert.match(text, /bullet/);
  assert.doesNotMatch(text, /\*\*/);
});

test("word count reflects readable content only", () => {
  assert.equal(wordCount("one two three"), 3);
  assert.equal(wordCount("# Title\n\nbody words here"), 4);
});

test("table of contents is built from level 2-3 headings", () => {
  const toc = tableOfContents("# Title\n\n## One\n\n### Two\n\n#### Three");
  assert.deepEqual(
    toc.map((entry) => entry.text),
    ["One", "Two"],
  );
  assert.equal(toc[0].id, "one");
});

test("heading slugs are stable and safe", () => {
  assert.equal(slugifyHeading("Fick's Law!"), "ficks-law");
  assert.equal(slugifyHeading("Gas exchange"), "gas-exchange");
});

test("sections are split on headings", () => {
  const sections = parseSections("## One\nbody one\n## Two\nbody two");
  assert.equal(sections.length, 2);
  assert.equal(sections[0].heading, "One");
  assert.equal(sections[1].body, "body two");
});

test("reading time is at least one minute", () => {
  assert.equal(readingMinutes("short"), 1);
  assert.ok(readingMinutes("word ".repeat(600)) >= 3);
});

test("key terms are counted from bold spans", () => {
  assert.equal(countKeyTerms("**one** and **two**"), 2);
  assert.equal(countKeyTerms("no bold"), 0);
});

test("structured notes convert to markdown", () => {
  const markdown = noteToMarkdown(
    [{ heading: "Fick's law", body: "Rate of diffusion.", bullets: ["Surface area"] }],
    [{ term: "Gradient", definition: "A difference in concentration." }],
  );
  assert.match(markdown, /## Fick's law/);
  assert.match(markdown, /- Surface area/);
  assert.match(markdown, /## Key terms/);
  assert.match(markdown, /\*\*Gradient\*\*/);
});