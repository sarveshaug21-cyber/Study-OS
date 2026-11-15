"use client";

import type { ReactNode } from "react";
import {
  parseMarkdown,
  slugifyHeading,
  type InlineToken,
  type MarkdownBlock,
} from "@/lib/markdown";
import { cn } from "@/lib/utils";

function renderInline(tokens: InlineToken[], keyPrefix = "i"): ReactNode {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case "text":
        return <span key={key}>{token.value}</span>;
      case "strong":
        return (
          <strong key={key} className="font-semibold text-ink">
            {renderInline(token.value, key)}
          </strong>
        );
      case "emphasis":
        return <em key={key}>{renderInline(token.value, key)}</em>;
      case "code":
        return (
          <code
            key={key}
            className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-ink-soft"
          >
            {token.value}
          </code>
        );
      case "math":
        return (
          <span
            key={key}
            className="inline-block rounded bg-indigo-50/80 px-1.5 py-0.5 font-mono text-[0.9em] font-medium text-indigo-900 border border-indigo-100"
          >
            {token.value}
          </span>
        );
      case "link":
        return (
          <a
            key={key}
            href={token.href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-700 underline decoration-brand-200 underline-offset-2 hover:text-brand-800"
          >
            {renderInline(token.value, key)}
          </a>
        );
      default:
        return null;
    }
  });
}

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
  switch (block.type) {
    case "heading": {
      const level = Math.min(6, Math.max(2, block.level));
      const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
      const id = slugifyHeading(
        block.children
          .map((token) => (token.type === "text" ? token.value : ""))
          .join(""),
      );
      return (
        <Tag
          key={index}
          id={id}
          className={cn(
            "scroll-mt-24 font-semibold tracking-tight text-ink",
            block.level <= 2
              ? "mt-8 text-lg first:mt-0"
              : block.level === 3
                ? "mt-6 text-base"
                : "mt-5 text-sm",
          )}
        >
          {renderInline(block.children, `h${index}`)}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p
          key={index}
          className="whitespace-pre-line leading-7 text-ink-soft"
        >
          {renderInline(block.children, `p${index}`)}
        </p>
      );
    case "list":
      return block.ordered ? (
        <ol
          key={index}
          className="list-decimal space-y-1.5 pl-5 leading-7 text-ink-soft marker:font-semibold marker:text-brand-600"
        >
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `ol${index}-${itemIndex}`)}</li>
          ))}
        </ol>
      ) : (
        <ul key={index} className="space-y-1.5">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex gap-2.5 leading-7 text-ink-soft">
              <span
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                aria-hidden="true"
              />
              <span>{renderInline(item, `ul${index}-${itemIndex}`)}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={index}
          className="rounded-r-lg border-l-2 border-brand-300 bg-brand-50/50 py-2 pl-4 pr-3 italic leading-7 text-ink-soft"
        >
          {renderInline(block.children, `q${index}`)}
        </blockquote>
      );
    case "code":
      return (
        <pre
          key={index}
          className="overflow-x-auto rounded-xl bg-night p-4 text-[0.8rem] leading-6 text-slate-200"
        >
          <code>{block.value}</code>
        </pre>
      );
    case "math":
      return (
        <div
          key={index}
          className="my-4 overflow-x-auto rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-center font-mono text-[0.95rem] font-semibold text-indigo-950"
        >
          {block.value}
        </div>
      );
    case "rule":
      return <hr key={index} className="my-6 border-slate-200" />;
    case "table":
      return (
        <div key={index} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.header.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-ink"
                  >
                    {renderInline(cell, `th${index}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100 last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-2 align-top leading-6 text-ink-soft"
                    >
                      {renderInline(cell, `td${index}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export function MarkdownRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = parseMarkdown(content);
  if (!blocks.length) {
    return (
      <p className={cn("text-sm text-ink-muted", className)}>
        This note has no content yet.
      </p>
    );
  }
  return (
    <div className={cn("space-y-3", className)}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
