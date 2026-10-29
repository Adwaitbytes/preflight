/**
 * The light the landing hero gives off, carried to the top of every page: a soft accent glow over
 * a dot field that fades before the content. The landing's opaque hero simply covers it.
 */
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-14 -z-10 h-[36rem] overflow-hidden print:hidden">
      <div className="absolute inset-0 bg-[radial-gradient(55%_65%_at_50%_0%,var(--glow),transparent_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--dot)_1px,transparent_1.4px)] [background-size:22px_22px] [mask-image:radial-gradient(65%_75%_at_50%_0%,black,transparent_78%)]" />
    </div>
  );
}
