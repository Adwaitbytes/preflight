export interface SourceRef {
  /** Only http(s) URLs become links; anything else is shown as text */
  href: string | null;
  label: string;
}

/** `https://.../macros/errors.rs#L180` reads as `errors.rs#L180`; a storage item name stays as it is */
export function parseSource(source: string): SourceRef {
  const text = source.trim();
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { href: null, label: text };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { href: null, label: text };
  const file = url.pathname.split("/").filter(Boolean).at(-1);
  return { href: url.href, label: file ? `${file}${url.hash}` : url.host };
}
