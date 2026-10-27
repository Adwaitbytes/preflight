# 004 Brand and site quality

Date: 2026-10-28, Day 2 night. Measured on a production build served with `next start` and `PREFLIGHT_API_URL=https://preflight-lemon.vercel.app`, Lighthouse 12.8.2 (default mobile and `--preset=desktop`), axe-core 4.14 through Playwright in Chrome, WCAG 2.0 to 2.2 A and AA plus best practice rules

## Question

What do the best developer tool sites get right, how does Preflight measure against that, and what mark should the product carry

## What the reference sites do

Read from the live pages on 2026-10-28 with a script that loaded each one at 1440 px and pulled the head, the h1 metrics and the landmarks

| Site | h1 | Background | theme-color | Icons | Manifest | Canonical | Skip link |
|---|---|---|---|---|---|---|---|
| linear.app | 64 px, weight 510, tracking -0.022em, Inter | #08090a | #08090a | ico, svg, apple 180 | yes | yes | yes |
| docs.stripe.com | 32 px, weight 700, system | white | none | svg, png 512, apple 180 | no | yes | yes |
| vercel.com | 64 px, weight 400, tracking -0.06em, Geist | #fafafa | both schemes | ico, apple set | yes | yes | yes |
| raycast.com | 64 px, weight 600, Inter | #07080a | none | one png | no | yes | no |
| resend.com | 96 px serif display over an Inter body | #000000 | #000000 | ico, apple set | no | yes | no |
| tenderly.co | 79 px, weight 600, tracking -0.035em, DM Sans | #0a0a0c | #0a0a10 | ico, png 16 and 32 | no | yes | no |

What they share: one display size between 64 and 96 px with negative tracking, a near black canvas, one accent, a real product surface in or right under the hero (Linear shows its app, Tenderly a simulation trace), a mark that works as a bare glyph in the header, `summary_large_image` Open Graph on every page, and a canonical link on every page. Half of them skip landmarks or a skip link, so that is where Preflight can be better than the reference, not just equal to it

Sources: https://linear.app, https://stripe.com/docs (redirects to docs.stripe.com), https://vercel.com, https://www.raycast.com, https://resend.com, https://tenderly.co. Standards used for the thresholds: https://web.dev/articles/vitals (LCP 2.5 s, INP 200 ms, CLS 0.1), https://www.w3.org/TR/WCAG22/ (1.4.3 contrast, 1.4.10 reflow, 2.4.1 bypass blocks, 2.4.7 focus visible), https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs (icon set), https://web.dev/articles/maskable-icon (maskable safe zone), https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md (how mobile LCP is simulated)

## Rubric

Each row is checkable. Before is the tree as it stood at the start of this pass, after is the tree at the end of it

| Area | Criterion | How measured | Before | After |
|---|---|---|---|---|
| Brand | A mark that is ownable, means something, reads at 16 px and works in one colour and both themes | Rendered at 16, 24, 32, 48 and 96 px at 1x and 2x on both grounds and on dark and light tab strips | Check in a rounded square, the default icon of every task app | P drawn as one flight path with a checkpoint node, see below |
| Brand | The mark appears everywhere the product does | Header, footer, favicon, apple icon, manifest, every Open Graph card | Header and footer only; OG cards drew a separate check | One geometry in `lib/brand.ts` feeds all of them |
| Typography | One display size with tight tracking, a body at 15 to 17 px, a mono for hashes | Computed styles | Display 68 px, -0.042em, Geist and Geist Mono | Unchanged, it already matched the reference set |
| Typography | Fonts cost little on the critical path | Lighthouse network requests | Two full variable fonts, 141 KB, both preloaded | Subset to Latin, Latin Extended A, Greek and the symbols the UI uses: 78 KB |
| Colour | Every text token passes 4.5:1 on every surface it sits on, both themes | Contrast computed for each token on background, surface, surface 2 and surface 3, and each semantic ink on its own tint | Light faint 4.41 on surface 2; light healthy 4.48, critical 4.43, high 4.30 on their tints over surface 2; JSON literals in light accent 4.33 | Light faint #62666f (4.71 or better), healthy #136f37 (4.89), critical #b42626 (4.68), high #a34303 (4.50); JSON literals use accent ink. Dark tokens already passed (lowest 4.75) |
| Colour | Focus rings appear in the ring colour at once | Inspected `transition-colors` behaviour | Ring faded in from the text colour over 150 ms | `outline-color` is set on every element ahead of focus, so there is nothing to animate |
| Layout | No horizontal page scroll at 375 px | `scrollWidth - clientWidth` on nine pages, both themes | Doctor overflowed by 30 px (a screen reader table sized to its content) | None anywhere |
| Hero | One focal point, the question, and proof that the answer is real | Screenshots at 1440 and 375 | Copy and input on the left half, empty right half | The h1, the omnibox, three proof points, and the real recorded Doctor answer to the h1 beside it, over the brand flight path |
| Hero | The input says what it will do and refuses junk | Typed `garbage$$` | Silently searched subnets for it; disabled Diagnose at 2.29:1 | `invalid` input kind with its own hint and `aria-invalid`; disabled button on surface 3 with muted text; hint describes the routing |
| Information architecture | Every page has one h1 and headings in order | axe `page-has-heading-one`, `heading-order` | 404 had no h1; subnet cards were h3 under the h1 | Error and not found states render an h1; the grid has a hidden h2 |
| Information architecture | Lists are valid | axe `definition-list`, `dlitem` | Hyperparameter rows nested `div` in `dl` (84 nodes on /plan) | Grid rows with `dt`, `dd`, `dd` |
| Trust | Real numbers with a source, no claims without one | Read the hero and cards | Recorded reads, block numbers on the cards | Plus a proof row: read only, never asks for keys; Finney, testnet and local; every answer cites its block |
| Motion | Motion explains, and stops for reduced motion | Watched the hero, toggled `prefers-reduced-motion` | Fade up on the hero text | The runway fades in, the checkpoint lands, the climb draws, the answer card settles; all CSS, all end in their final state under reduced motion |
| States | Loading, empty, error and invalid states everywhere | Read every route | Present, but /subnets and /plan replaced the whole page with a skeleton | Header paints at once, only the chain read streams behind a skeleton |
| Performance | LCP under 2.5 s, CLS under 0.1, TBT under 200 ms | Lighthouse, table below | Mobile LCP 3.4 to 4.3 s; desktop CLS up to 0.127 | Mobile LCP 2.9 s on the landing, simulator and planner; CLS 0 everywhere |
| Performance | No library loads on a page that does not use it | Chunk contents of every script requested before LCP | zod (34 KB) on every page through the root error boundary; cmdk and the Radix dialog on every page; every result view and the API client on every hosted page through LocalView | zod only where a page validates; palette, network menu and LocalView load after hydration or only on Local |
| Accessibility | Zero serious axe violations | axe on nine pages, two themes, two widths | 74 serious and 8 moderate across 7 rules | 54 serious across 2 rules, both in the header and footer, which this pass may not edit; see Not fixed |
| SEO | Title, description and canonical per page | Lighthouse SEO, head of every route | No canonical anywhere; no description on six routes | Every route has both; doctor and tx canonicals keep the netuid |
| SEO | robots.txt and sitemap.xml | Fetched both | 404 | Generated from `lib/site.ts`; API paths disallowed |
| Social | Every shareable page has a branded card with the finding as the hero | Fetched `/opengraph-image` for home, doctor and tx | Doctor, tx and shared report cards failed to render (Satori rejects a `div` holding `block` plus a number as two children); home card was a 4 line sentence | All render; the headline is the hero and balanced, the runway and checkpoint sit under it. Satori added a gap after kerned words in Geist ("validator  has"), so the OG copies of Geist drop the GPOS table (`Geist-*-og.ttf`, allowed by the OFL, which reserves no font name) |
| Icons | ico, svg, apple touch, manifest with 192, 512 and a maskable 512 | Fetched each and read the head | One svg | `favicon.ico` (16, 32, 48), `icon.svg`, `apple-icon.png` 180, `manifest.webmanifest` with 192, 512 and maskable 512 |
| Mobile | theme-color matches the page | Head | Light value on light OS while the site opens dark | Opens on #0a0b0d and follows the theme toggle |

## The mark

Explored on a 24 unit grid and rendered side by side: a liftoff arc off a baseline, a runway with an arc, a horizon with a node, an arc through a ring gate, and five P constructions. The liftoff arcs read as a growth chart at 16 px. The horizon and gate read as generic. The P constructions read as a letter at every size and carry the story in the details

Chosen: a P written as one stroke. It rolls along the runway (the foot), lifts off (the stem), turns (the bowl) and stops at a checkpoint (the node) before the loop closes. The gap between node and stem is the "pre": the check happens before the commitment. The node takes the one accent, so the mark is graphite plus a single blue point, the same economy as the site

Construction: `M4 20h4V4h6a5 5 0 0 1 0 10`, stroke 2, round caps and joins, node at (13, 14) radius 2.5. Every straight edge lands on a whole pixel at 24 px. The favicon tile is a 32 unit square, radius 8, with the glyph scaled 1.2 and stroked 2.4 so it survives 16 px. The apple icon is full bleed (iOS rounds it), the maskable icon keeps the glyph inside the 80 percent safe circle. A design review found the full mark blurry at 16 to 22 px and closer to a music note than a P there, so interface sizes use an optical cut: no runway foot, stroke 3, `M7.5 18.5V5.5H12a4.5 4.5 0 0 1 0 9`, node at (12.75, 14.5) radius 2.25 (`MARK_SMALL_*` in `lib/brand.ts`, used by `LogoMark`). The favicon is the same cut on a 32 grid with a 4 unit stroke, exactly 2 px at 16 px. The full runway mark stays on the Open Graph cards, the apple icon and the manifest icons, where it is large enough to read. Rules: never below 16 px, clear space of one node diameter, one colour version via `LogoMark mono` for small print

## Lighthouse

Mobile, then desktop. perf / accessibility / best practices / SEO

| Page | Mobile before | Mobile after | Mobile LCP | Desktop before | Desktop after | Desktop CLS |
|---|---|---|---|---|---|---|
| `/` | 86 / 100 / 100 / 100 | 95 / 100 / 100 / 100 | 4.2 s to 2.9 s | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0 to 0 |
| `/doctor/finney/5EKtvz...Qmhq?netuid=64` | 85 / 100 / 100 / 90 | 87 / 100 / 100 / 91 | 4.3 s to 4.0 s | 99 / 100 / 100 / 90 | 99 / 100 / 100 / 91 | 0.054 to 0 |
| `/subnets` | 86 / 98 / 100 / 100 | 94 / 100 / 100 / 100 | 4.3 s to 3.1 s | 95 / 98 / 100 / 100 | 100 / 100 / 100 / 100 | 0.127 to 0 |
| `/subnets/64` | 85 / 92 / 100 / 100 | 87 / 100 / 100 / 100 | 4.3 s to 4.0 s | 97 / 92 / 100 / 100 | 99 / 100 / 100 / 100 | 0.101 to 0 |
| `/plan` | 85 / 92 / 100 / 100 | 95 / 100 / 100 / 100 | 4.3 s to 2.9 s | 97 / 92 / 100 / 100 | 100 / 100 / 100 / 100 | 0.088 to 0 |
| `/sim` | 92 / 100 / 100 / 100 | 95 / 100 / 100 / 100 | 3.4 s to 2.9 s | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0 to 0 |

Why mobile LCP was high everywhere: Lighthouse simulates mobile LCP from every request that starts before the observed LCP. On localhost all async scripts arrived before the first frame, React hydrated, and only then did the page paint (observed first paint on the landing was 1377 ms). Cutting what loads in the head (zod, cmdk, the Radix dialog and menu, LocalView with every result view, half the font bytes) moved the observed paint to 81 ms and the simulated LCP from 4.2 s to 2.9 s. TBT stayed between 10 and 30 ms throughout

## Decision

- The mark above, defined once in `web/src/lib/brand.ts` and used by `Logo`, `LogoMark`, the icons and the Open Graph renderer
- Tokens stay: graphite, paper and one runway blue. Only four light inks were darkened, each now at 4.5:1 or better on its own tint over every surface
- The landing hero answers its own question with the recorded Doctor read and draws the mark at hero scale: a dashed runway centreline, the checkpoint, the climb behind the answer
- Pages paint their header before any chain read; libraries a page does not need load after hydration or not at all

## Not fixed

- Two serious axe rules remain on every page, both in files this pass may only touch for the logo. `site-header.tsx`: the search button's `aria-label="Open command menu"` does not contain its visible text "Search or paste" (label-content-name-mismatch); `aria-label="Search or paste"` fixes it. `site-footer.tsx`: the scrolling MCP install `<code>` cannot take focus (scrollable-region-focusable); `tabIndex={0}` on it fixes it
- Doctor and subnet detail stay at 87 on mobile. Their LCP is the diagnosis or subnet header, which only exists after a live chain read, so every script on the page counts against it. The fix is a shell that paints the hotkey or netuid header from the URL before the read, which means restructuring `doctor-view.tsx` and `subnet-detail-view.tsx`; both are being changed by other work right now
- Doctor SEO is 91 because Next 16 streams `generateMetadata` into the body for browsers. Crawlers that cannot run JavaScript (Twitterbot, Slackbot) get the tags in the head, checked with curl; Googlebot renders the body. Forcing blocking metadata for every visitor would trade real TTFB for a lab score, so it stays
- The sitemap lists the indexable routes only; `/guide` should be added to `INDEXED_ROUTES` in `web/src/lib/site.ts` once it ships

## Final measurement, production

Re-run on https://preflight-lemon.vercel.app after the logo change, the guide and the fleet and mining pages shipped, Lighthouse 12 (performance / accessibility / best practices / SEO):

| Page | Mobile | Mobile LCP | Desktop | CLS |
|---|---|---|---|---|
| `/` | 97 / 100 / 100 / 100 | 2.49 s | 100 / 100 / 100 / 100 | 0 |
| `/guide` | 93 / 100 / 100 / 100 | 3.09 s | 100 / 100 / 100 / 100 | 0 |
| `/subnets` | 98 / 100 / 100 / 100 | 2.33 s | 100 / 100 / 100 / 100 | 0 |
| `/subnets/51/mine` | 97 / 100 / 100 / 100 | 2.59 s | 100 / 100 / 100 / 100 | 0 |
| `/plan` | 100 / 100 / 100 / 100 | 1.84 s | 100 / 100 / 100 / 100 | 0 |
| `/sim` | 98 / 100 / 100 / 100 | 2.33 s | 100 / 100 / 100 / 100 | 0 |

What moved the last points: the hosted site no longer probes `127.0.0.1:7979` on every visit (a failed request in the console cost best practices on every page); the guide's definition lists are valid; the mining page's metadata no longer waits on the chain, so it lands in the head; the directory sorts by emission share, so health scores arriving 10 s later no longer reorder the cards (CLS 0.32 to 0)
