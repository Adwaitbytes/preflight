import { Fragment } from "react";

const URL_PATTERN = /(https?:\/\/[^\s),]+)/g;

function linkLabel(url: string): string {
  try {
    const { pathname, hash } = new URL(url);
    const file = pathname.split("/").filter(Boolean).slice(-2).join("/");
    return `${file}${hash}` || url;
  } catch {
    return url;
  }
}

function Plain({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="rounded font-mono text-[0.86em] text-foreground underline decoration-line-strong underline-offset-4 hover:decoration-foreground"
          >
            {linkLabel(part)}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Renders `backtick` spans from catalog text as inline code and bare URLs as short source links */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded-[5px] bg-surface-2 px-1.5 py-px font-mono text-[0.86em] text-foreground shadow-[0_0_0_1px_var(--line)]">
            {part}
          </code>
        ) : (
          <Plain key={i} text={part} />
        ),
      )}
    </>
  );
}
