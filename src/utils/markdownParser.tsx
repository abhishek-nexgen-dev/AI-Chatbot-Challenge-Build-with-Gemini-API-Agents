import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#070b14] text-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0f172a] border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-300">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans text-xs">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <pre className="m-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const renderInlineFormatting = (text: string): React.ReactNode => {
  const segments: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    const inlineCodeMatch = remaining.match(/^`([^`]+)`/);
    if (inlineCodeMatch) {
      segments.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded text-[12.5px] font-mono bg-slate-800 text-slate-200 border border-slate-700/60"
        >
          {inlineCodeMatch[1]}
        </code>
      );
      remaining = remaining.slice(inlineCodeMatch[0].length);
      continue;
    }

    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      segments.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-slate-100">
          {renderInlineFormatting(boldMatch[1])}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      segments.push(
        <em key={`italic-${keyIndex++}`} className="italic text-slate-300">
          {renderInlineFormatting(italicMatch[1])}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    if (linkMatch) {
      segments.push(
        <a
          key={`link-${keyIndex++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const nextSpecialIndex = remaining.search(/[`*[]/);
    if (nextSpecialIndex === -1) {
      segments.push(remaining);
      break;
    } else if (nextSpecialIndex > 0) {
      segments.push(remaining.slice(0, nextSpecialIndex));
      remaining = remaining.slice(nextSpecialIndex);
    } else {
      segments.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return segments;
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const rawBlocks = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];
  let inList = false;
  let isOrderedList = false;
  let listItems: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    if (isOrderedList) {
      elements.push(
        <ol key={key} className="my-2.5 pl-6 list-decimal space-y-1 text-slate-200">
          {listItems}
        </ol>
      );
    } else {
      elements.push(
        <ul key={key} className="my-2.5 pl-6 list-disc space-y-1 text-slate-200">
          {listItems}
        </ul>
      );
    }
    listItems = [];
    inList = false;
  };

  const flushTable = (key: string) => {
    if (tableRows.length === 0) return;
    const header = tableRows[0];
    const dataRows = tableRows.slice(1).filter((row) => !row.every((cell) => /^[-:| ]+$/.test(cell)));

    elements.push(
      <div key={key} className="my-3 overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-[#0f172a]">
            <tr>
              {header.map((col, idx) => (
                <th
                  key={`th-${idx}`}
                  className="px-3.5 py-2 text-left font-semibold text-slate-200 text-xs uppercase tracking-wider"
                >
                  {renderInlineFormatting(col.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-[#090e1a]">
            {dataRows.map((row, rIdx) => (
              <tr key={`tr-${rIdx}`} className="hover:bg-slate-800/40">
                {row.map((cell, cIdx) => (
                  <td key={`td-${rIdx}-${cIdx}`} className="px-3.5 py-2 text-slate-300">
                    {renderInlineFormatting(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < rawBlocks.length; i++) {
    const line = rawBlocks[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-block-${i}`}
            language={codeLanguage}
            code={codeLines.join('\n')}
          />
        );
        inCodeBlock = false;
        codeLines = [];
        codeLanguage = '';
      } else {
        if (inList) flushList(`list-before-code-${i}`);
        if (inTable) flushTable(`table-before-code-${i}`);
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (inList) flushList(`list-before-tbl-${i}`);
      inTable = true;
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|');
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (inList && !isOrderedList) flushList(`ul-before-ol-${i}`);
      inList = true;
      isOrderedList = true;
      listItems.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {renderInlineFormatting(orderedMatch[2])}
        </li>
      );
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)/);
    if (unorderedMatch) {
      if (inList && isOrderedList) flushList(`ol-before-ul-${i}`);
      inList = true;
      isOrderedList = false;
      listItems.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {renderInlineFormatting(unorderedMatch[1])}
        </li>
      );
      continue;
    }

    if (inList) {
      flushList(`list-${i}`);
    }

    if (line.trim().length === 0) {
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-4 mb-2 text-xl font-bold tracking-tight text-slate-100">
          {renderInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-3.5 mb-1.5 text-lg font-bold tracking-tight text-slate-100">
          {renderInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-3 mb-1 text-base font-semibold text-slate-100">
          {renderInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2.5 pl-3.5 border-l-2 border-indigo-500/70 text-slate-400 italic text-sm"
        >
          {renderInlineFormatting(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed text-slate-200 text-sm md:text-[14.5px]">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  if (inCodeBlock) {
    elements.push(
      <CodeBlock
        key="code-block-trailing"
        language={codeLanguage}
        code={codeLines.join('\n')}
      />
    );
  }

  if (inList) {
    flushList('list-trailing');
  }

  if (inTable) {
    flushTable('table-trailing');
  }

  return <div className="space-y-1 overflow-hidden">{elements}</div>;
};
