/**
 * Liquid glass for the DSH web page — a floating-card glass skin with a living
 * background, a settings page and a few optional details.
 *
 * Everything is client-side and removable: one stylesheet, a handful of
 * injected decorative layers, and one `settings.plugins.tab` page. No host
 * code, no requests, no session data.
 *
 * Shell facts the rules depend on:
 *  - `body` paints `--dsw-alias-bg-base`; the frame, the columns, the
 *    conversation and every page repaint it above the body. Clearing the token
 *    inside `#root` lets the injected background show through all of them.
 *  - the frame carries layout state as attributes (`data-sidebar-collapsed`,
 *    `data-sidebar-drawer`, `data-windows-titlebar`).
 *  - the sidebar column paints `--dsw-specific-sidebar-fill`; the slot renderer
 *    wraps the contribution in a `[data-slot]` anchor with `display: contents`,
 *    so the content root is the anchor's child.
 *  - the conversation header is `header[data-window-drag]`; the composer card is
 *    the only `*_card` class inside `[data-composer-seat]`.
 *  - menus paint their fill on a child `*_material` box from
 *    `--dsw-menu-surface-fill`; the host already blurs them at 40px.
 */

const STYLE_ID = 'dsh-liquid-glass'
const AMBIENT_ID = 'dsh-liquid-glass-ambient'
const WALLPAPER_ID = 'dsh-liquid-glass-wallpaper'
const WHALE_ID = 'dsh-liquid-glass-whale'
const FADES_ID = 'dsh-liquid-glass-fades'
const ATTR = 'data-liquid-glass'
const STORE_KEY = 'dsh-liquid-glass.settings.v1'

const DEFAULTS = {
  enabled: true,
  blur: 20,
  frost: 1,
  brightness: 50,
  background: 'fluid',
  motion: 'drift',
  image: '',
  imageBlur: 0,
  imageFrost: 0.12,
  whale: true,
  fades: true,
}

/* ── stylesheet ──────────────────────────────────────────────────────────── */

const CSS = `
/* ── tokens ──────────────────────────────────────────────────────────────── */
:root[data-liquid-glass] {
  --lg-blur: 20px;
  --lg-frost: 1;
  --lg-brightness: 50;
  --lg-sat: 150%;
  --lg-solid: #e2eef5;
  --lg-deep: #d2e6ee;
  --lg-blob-a: #a7d7e6;
  --lg-blob-b: #b2d1f4;
  --lg-blob-c: #d5cdf7;
  --lg-blob-opacity: 1;
  --lg-glass: rgb(255 255 255 / calc(0.46 * var(--lg-frost, 1)));
  --lg-sheen: rgb(255 255 255 / calc(0.26 * var(--lg-frost, 1)));
  --lg-hairline: rgb(15 36 60 / 12%);
  --lg-rim: rgb(255 255 255 / 70%);
  --lg-specular: rgb(255 255 255 / 50%);
  --lg-shadow: rgb(12 34 58 / 18%);
  --lg-host-base: #ffffff;
  --lg-menu-fallback: #fcfdfe;
}

:root[data-liquid-glass] body[data-ds-dark-theme] {
  --lg-solid: #04161b;
  --lg-deep: #061c22;
  --lg-blob-a: #0f5a60;
  --lg-blob-b: #0b3f63;
  --lg-blob-c: #22305f;
  --lg-blob-opacity: 0.85;
  --lg-glass: rgb(34 40 50 / calc(0.5 * var(--lg-frost, 1)));
  --lg-sheen: rgb(255 255 255 / calc(0.06 * var(--lg-frost, 1)));
  --lg-hairline: rgb(148 180 220 / 26%);
  --lg-rim: rgb(255 255 255 / 8%);
  --lg-specular: rgb(255 255 255 / 12%);
  --lg-shadow: rgb(0 0 0 / 45%);
  --lg-host-base: #151517;
  --lg-menu-fallback: #303136;
}

/* ── decorative layers: inert unless the skin is on ──────────────────────── */
#dsh-liquid-glass-ambient,
#dsh-liquid-glass-wallpaper,
#dsh-liquid-glass-whale,
#dsh-liquid-glass-fades {
  display: none;
  position: fixed;
  pointer-events: none;
}

/* ── ambient board ───────────────────────────────────────────────────────── */
:root[data-liquid-glass] {
  background-color: var(--lg-solid);
}

:root[data-liquid-glass] body,
:root[data-liquid-glass] #root {
  background-color: transparent;
}

:root[data-liquid-glass] #root {
  --dsw-alias-bg-base: transparent;
}

:root[data-liquid-glass] #root,
:root[data-liquid-glass] #root > * {
  background-color: transparent !important;
}

:root[data-liquid-glass] #root [class*="_frame"] {
  background-color: transparent !important;
}

:root[data-liquid-glass] #dsh-liquid-glass-ambient {
  display: block;
  inset: 0;
  z-index: -2;
  overflow: hidden;
  background: var(--lg-deep);
}

:root[data-liquid-glass] #dsh-liquid-glass-ambient i {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: var(--lg-blob-opacity);
  will-change: transform;
}

:root[data-liquid-glass] #dsh-liquid-glass-ambient i:nth-child(1) {
  inset: -30% -10% auto -20%;
  height: 95vh;
  background: radial-gradient(closest-side, var(--lg-blob-a), transparent 72%);
  animation: lg-drift-a 18s var(--ds-ease-in-out, ease-in-out) infinite alternate;
}

:root[data-liquid-glass] #dsh-liquid-glass-ambient i:nth-child(2) {
  inset: -25% -25% auto auto;
  width: 90vw;
  height: 90vh;
  background: radial-gradient(closest-side, var(--lg-blob-b), transparent 70%);
  animation: lg-drift-b 24s var(--ds-ease-in-out, ease-in-out) infinite alternate;
}

:root[data-liquid-glass] #dsh-liquid-glass-ambient i:nth-child(3) {
  inset: auto auto -35% -15%;
  width: 85vw;
  height: 85vh;
  background: radial-gradient(closest-side, var(--lg-blob-c), transparent 72%);
  animation: lg-drift-c 30s var(--ds-ease-in-out, ease-in-out) infinite alternate;
}

:root[data-liquid-glass][data-lg-motion="still"] #dsh-liquid-glass-ambient i {
  animation: none;
}

/* Background brightness: light scheme brightens above 50, dark scheme
   darkens below it, 50 is unchanged. One overlay, scheme-resolved. */
:root[data-liquid-glass] #dsh-liquid-glass-ambient::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / var(--lg-white-veil, 0)), rgb(255 255 255 / var(--lg-white-veil, 0))),
    linear-gradient(rgb(0 0 0 / var(--lg-black-veil, 0)), rgb(0 0 0 / var(--lg-black-veil, 0)));
}

:root[data-liquid-glass] {
  --lg-white-veil: calc(max(0, var(--lg-brightness) - 50) * 0.018);
  --lg-black-veil: calc(max(0, 50 - var(--lg-brightness)) * 0.018);
}

:root[data-liquid-glass] body:not([data-ds-dark-theme]) #dsh-liquid-glass-ambient::after {
  --lg-white-veil: calc(max(0, var(--lg-brightness) - 50) * 0.018);
  --lg-black-veil: 0;
}

@keyframes lg-drift-a {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(9vw, 6vh, 0) scale(1.16); }
}

@keyframes lg-drift-b {
  from { transform: translate3d(0, 0, 0) scale(1.05); }
  to { transform: translate3d(-10vw, 8vh, 0) scale(0.92); }
}

@keyframes lg-drift-c {
  from { transform: translate3d(0, 0, 0) scale(0.98); }
  to { transform: translate3d(8vw, -7vh, 0) scale(1.14); }
}

/* ── custom wallpaper ────────────────────────────────────────────────────── */
:root[data-liquid-glass][data-lg-bg="image"] #dsh-liquid-glass-wallpaper {
  display: block;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--lg-deep);
}

:root[data-liquid-glass] #dsh-liquid-glass-wallpaper-image {
  position: absolute;
  inset: -60px;
  background-image: var(--lg-wallpaper, none);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(var(--lg-wallpaper-blur, 0px));
}

:root[data-liquid-glass] #dsh-liquid-glass-wallpaper::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / var(--lg-wallpaper-frost, 0)), rgb(255 255 255 / var(--lg-wallpaper-frost, 0))),
    linear-gradient(rgb(0 0 0 / var(--lg-black-veil, 0)), rgb(0 0 0 / var(--lg-black-veil, 0)));
}

:root[data-liquid-glass] body[data-ds-dark-theme] #dsh-liquid-glass-wallpaper::after {
  background-image:
    linear-gradient(rgb(6 12 20 / var(--lg-wallpaper-frost, 0)), rgb(6 12 20 / var(--lg-wallpaper-frost, 0))),
    linear-gradient(rgb(0 0 0 / var(--lg-black-veil, 0)), rgb(0 0 0 / var(--lg-black-veil, 0)));
}

/* ── particle whale ──────────────────────────────────────────────────────── */
:root[data-liquid-glass][data-lg-whale="on"] #dsh-liquid-glass-whale {
  display: block;
  z-index: -1;
  opacity: 0.9;
}

/* ── page edge fades ─────────────────────────────────────────────────────── */
:root[data-liquid-glass][data-lg-fades="on"] #dsh-liquid-glass-fades {
  display: block;
  inset: 0;
  z-index: 6;
}

:root[data-liquid-glass] #dsh-liquid-glass-fades i {
  position: absolute;
  left: 0;
  right: 0;
  height: 14px;
  backdrop-filter: blur(5px);
  background: rgb(255 255 255 / 0.18);
}

:root[data-liquid-glass] body[data-ds-dark-theme] #dsh-liquid-glass-fades i {
  background: rgb(0 0 0 / 0.14);
}

:root[data-liquid-glass] #dsh-liquid-glass-fades i[data-edge="top"] {
  top: 0;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 0%, transparent 100%);
}

:root[data-liquid-glass] #dsh-liquid-glass-fades i[data-edge="bottom"] {
  bottom: 0;
  -webkit-mask-image: linear-gradient(0deg, #000 0%, transparent 100%);
  mask-image: linear-gradient(0deg, #000 0%, transparent 100%);
}

/* ── Windows caption strip ───────────────────────────────────────────────── */
/* The strip is part of the page, not the native frame: the desktop preload
   injects a DOM menu bar ([data-windows-menu], a shadow host with no
   background) and reserves 40px, and the frame paints that band with
   --dsw-specific-sidebar-fill. Clearing the band lets the ambient run to the
   top edge, and the system window buttons get a transparent plate because the
   preload measures the fill of its hidden probe span below. */
:root[data-liquid-glass][data-windows-titlebar] [class*="_frame"]::before {
  background: transparent !important;
}

:root[data-liquid-glass][data-windows-titlebar] body > span[style*="--dsw-specific-sidebar-fill"] {
  background-color: transparent !important;
}

/* ── window rim: the glass edge of the whole sheet ───────────────────────── */
#dsh-liquid-glass-rim {
  display: none;
  position: fixed;
  inset: 0;
  pointer-events: none;
}

:root[data-liquid-glass] #dsh-liquid-glass-rim {
  display: block;
  z-index: 30;
  border-radius: 10px;
  box-shadow:
    inset 0 0 0 1px var(--lg-rim),
    inset 0 1px 0 rgb(255 255 255 / calc(0.55 * var(--lg-frost, 1))),
    inset 0 0 26px -8px var(--lg-shadow);
}

/* A whisper of grain over the colour fields: the glass panels then have real
   texture to blur, and the flat gradients stop banding. */
:root[data-liquid-glass] #dsh-liquid-glass-ambient::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.28;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
  background-size: 220px 220px;
}
/* ── the shared card material ────────────────────────────────────────────── */
/* The card itself carries no filter: on Windows the column's collapse toggle
   and the collapsed-rail buttons are position:fixed into the caption strip,
   and a filter here would become their containing block and drag them into the
   card. The material is painted by ::before instead, which blurs exactly the
   same backdrop without adopting any of the card's descendants. */
:root[data-liquid-glass] [class*="sidebarCol"] > [data-slot] > *,
:root[data-liquid-glass] [data-slot="sidebar"] > * {
  position: relative;
  isolation: isolate;
  margin: 10px;
  height: calc(100% - 20px);
  box-sizing: border-box;
  border: 1px solid var(--lg-hairline);
  border-radius: 20px;
  background: transparent !important;
  box-shadow:
    inset 0 1px 0 var(--lg-rim),
    0 12px 32px -14px var(--lg-shadow);
  overflow: hidden;
}

:root[data-liquid-glass] [data-slot="sidebar"] > *::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: linear-gradient(160deg, var(--lg-sheen), transparent 46%), var(--lg-glass);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  pointer-events: none;
}

:root[data-liquid-glass] [class*="sidebarCol"] {
  background: transparent !important;
  border-right: 0 !important;
  box-shadow: none !important;
}

/* The collapsed rail and the drawer keep the stock geometry. */
:root[data-liquid-glass] [class*="_frame"][data-sidebar-collapsed] [data-slot="sidebar"] > * {
  margin: 0;
  height: 100%;
  border: 0;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none;
}

:root[data-liquid-glass] [class*="_frame"][data-sidebar-collapsed] [data-slot="sidebar"] > *::before {
  display: none;
}

:root[data-liquid-glass] [class*="_frame"][data-sidebar-drawer] [data-slot="sidebar"] > *::before {
  background: linear-gradient(160deg, var(--lg-sheen), transparent 46%), rgb(255 255 255 / 0.88);
}

:root[data-liquid-glass] body[data-ds-dark-theme] [class*="_frame"][data-sidebar-drawer] [data-slot="sidebar"] > *::before {
  background: linear-gradient(160deg, rgb(255 255 255 / 5%), transparent 46%), rgb(20 26 34 / 0.92);
}

:root[data-liquid-glass] [data-slot="sidebar"] [class*="scrollFade"] {
  background: linear-gradient(to bottom, transparent, var(--lg-glass)) !important;
}

/* ── header: a detached glass bar ────────────────────────────────────────── */
:root[data-liquid-glass] header[data-window-drag]:has([data-conversation-header-leading]) {
  height: auto;
  margin: 10px 12px 0;
  padding: 8px 14px;
  box-sizing: border-box;
  border: 1px solid var(--lg-hairline);
  border-radius: 18px;
  background: linear-gradient(160deg, var(--lg-sheen), transparent 46%), var(--lg-glass) !important;
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  box-shadow:
    inset 0 1px 0 var(--lg-rim),
    0 10px 26px -16px var(--lg-shadow);
}

/* ── composer: a floating pane over the transcript ───────────────────────── */
:root[data-liquid-glass] [data-composer-seat] [class*="_card"] {
  background-color: transparent !important;
  background-image:
    radial-gradient(circle 440px at var(--lg-mx, 50%) var(--lg-my, -40%), var(--lg-specular) 0%, transparent 60%),
    linear-gradient(160deg, var(--lg-sheen), transparent 46%),
    linear-gradient(var(--lg-glass), var(--lg-glass));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  box-shadow:
    inset 0 1px 0 var(--lg-rim),
    inset 0 0 0 1px var(--lg-hairline),
    0 18px 44px -20px var(--lg-shadow),
    0 2px 10px -6px var(--lg-shadow);
}

/* ── menus, popovers and dialogs ─────────────────────────────────────────── */
:root[data-liquid-glass] [data-menu-material] [class*="_material"],
:root[data-liquid-glass] [data-menu-material][class*="_material"] {
  box-shadow:
    inset 0 1px 0 var(--lg-rim),
    inset 0 0 0 0.5px var(--lg-hairline);
}

:root[data-liquid-glass] body {
  --dsw-menu-surface-fill: color-mix(in srgb, rgb(255 255 255) 58%, transparent);
  --dsw-specific-menu: color-mix(in srgb, rgb(255 255 255) 58%, transparent);
}

:root[data-liquid-glass] body[data-ds-dark-theme] {
  --dsw-menu-surface-fill: color-mix(in srgb, rgb(30 38 48) 72%, transparent);
  --dsw-specific-menu: color-mix(in srgb, rgb(30 38 48) 72%, transparent);
}

/* ── settings dialog ─────────────────────────────────────────────────────── */
/* The settings panel is portalled to <body> as [role=dialog] with a stable
   data-shortcut-modal marker, inside a presentation wrapper next to the
   dimming mask. It lives outside #root, so the base-token override never
   reached it; give the panel its own glass and lift the mask into a soft
   frosted veil so the app stays visible behind the sheet. */
:root[data-liquid-glass] [data-shortcut-modal="settings"] {
  position: relative;
  isolation: isolate;
  background: transparent !important;
  border: 1px solid var(--lg-hairline);
  box-shadow:
    inset 0 1px 0 var(--lg-rim),
    0 30px 70px -30px var(--lg-shadow) !important;
  --dsw-alias-bg-base: transparent;
  --dsw-alias-bg-layer-1: color-mix(in srgb, rgb(255 255 255) 64%, transparent);
  --dsw-alias-bg-layer-2: color-mix(in srgb, rgb(255 255 255) 52%, transparent);
}

:root[data-liquid-glass] body[data-ds-dark-theme] [data-shortcut-modal="settings"] {
  --dsw-alias-bg-layer-1: color-mix(in srgb, rgb(42 48 60) 72%, transparent);
  --dsw-alias-bg-layer-2: color-mix(in srgb, rgb(32 38 48) 64%, transparent);
}

:root[data-liquid-glass] [data-shortcut-modal="settings"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: linear-gradient(160deg, var(--lg-sheen), transparent 46%), var(--lg-glass);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  pointer-events: none;
}

:root[data-liquid-glass] [role="presentation"]:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"] {
  background: color-mix(in srgb, var(--lg-deep) 58%, transparent) !important;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* ── reduced transparency / contrast / motion ────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  :root[data-liquid-glass] #dsh-liquid-glass-ambient i {
    animation: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  :root[data-liquid-glass] {
    background-color: var(--lg-host-base);
  }

  :root[data-liquid-glass] #dsh-liquid-glass-ambient,
  :root[data-liquid-glass] #dsh-liquid-glass-wallpaper,
  :root[data-liquid-glass][data-lg-whale="on"] #dsh-liquid-glass-whale,
  :root[data-liquid-glass][data-lg-fades="on"] #dsh-liquid-glass-fades {
    display: none;
  }

  :root[data-liquid-glass] #root {
    --dsw-alias-bg-base: var(--lg-host-base);
  }

  :root[data-liquid-glass] [data-slot="sidebar"] > * {
    margin: 0;
    height: 100%;
    border: 0;
    border-radius: 0;
    background: var(--dsw-specific-sidebar-fill) !important;
    box-shadow: none;
  }

  :root[data-liquid-glass] [data-slot="sidebar"] > *::before {
    display: none;
  }

  :root[data-liquid-glass] header[data-window-drag]:has([data-conversation-header-leading]) {
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: none;
  }

  :root[data-liquid-glass] [data-composer-seat] [class*="_card"] {
    background-image: none;
    background-color: var(--dsw-specific-input-major) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: var(--dsw-elevation-soft);
  }

  :root[data-liquid-glass] [data-menu-material] [class*="_material"],
  :root[data-liquid-glass] [data-menu-material][class*="_material"] {
    background-color: var(--lg-menu-fallback) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: 0 0 0 0.5px var(--dsw-alias-border-l3);
  }

  :root[data-liquid-glass][data-windows-titlebar] [class*="_frame"]::before {
    background: var(--dsw-specific-sidebar-fill) !important;
  }

  :root[data-liquid-glass][data-windows-titlebar] body > span[style*="--dsw-specific-sidebar-fill"] {
    background-color: var(--dsw-specific-sidebar-fill) !important;
  }

  :root[data-liquid-glass] [data-shortcut-modal="settings"] {
    background: var(--dsw-alias-bg-layer-2) !important;
    --dsw-alias-bg-base: var(--lg-host-base);
    border: 0;
    box-shadow: var(--dsw-elevation-prominent) !important;
  }

  :root[data-liquid-glass] [data-shortcut-modal="settings"]::before {
    display: none;
  }

  :root[data-liquid-glass] [role="presentation"]:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"] {
    background: var(--dsw-alias-bg-mask-1) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  :root[data-liquid-glass] body {
    --dsw-menu-surface-fill: var(--lg-menu-fallback);
    --dsw-specific-menu: var(--lg-menu-fallback);
    --dsw-menu-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  :root[data-liquid-glass] {
    background-color: var(--lg-host-base);
  }

  :root[data-liquid-glass] #dsh-liquid-glass-ambient,
  :root[data-liquid-glass] #dsh-liquid-glass-wallpaper,
  :root[data-liquid-glass][data-lg-whale="on"] #dsh-liquid-glass-whale,
  :root[data-liquid-glass][data-lg-fades="on"] #dsh-liquid-glass-fades {
    display: none;
  }

  :root[data-liquid-glass] #root {
    --dsw-alias-bg-base: var(--lg-host-base);
  }

  :root[data-liquid-glass] [data-slot="sidebar"] > * {
    margin: 0;
    height: 100%;
    border: 0;
    border-right: 1px solid var(--dsw-alias-border-l3);
    border-radius: 0;
    background: var(--dsw-specific-sidebar-fill) !important;
    box-shadow: none;
  }

  :root[data-liquid-glass] [data-slot="sidebar"] > *::before {
    display: none;
  }

  :root[data-liquid-glass] header[data-window-drag]:has([data-conversation-header-leading]) {
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: none;
  }

  :root[data-liquid-glass] [data-composer-seat] [class*="_card"] {
    background-image: none;
    background-color: var(--dsw-specific-input-major) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: var(--dsw-elevation-soft);
  }

  :root[data-liquid-glass] [data-menu-material] [class*="_material"],
  :root[data-liquid-glass] [data-menu-material][class*="_material"] {
    background-color: var(--lg-menu-fallback) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: 0 0 0 1px var(--dsw-alias-border-l2);
  }

  :root[data-liquid-glass][data-windows-titlebar] [class*="_frame"]::before {
    background: var(--dsw-specific-sidebar-fill) !important;
  }

  :root[data-liquid-glass][data-windows-titlebar] body > span[style*="--dsw-specific-sidebar-fill"] {
    background-color: var(--dsw-specific-sidebar-fill) !important;
  }

  :root[data-liquid-glass] [data-shortcut-modal="settings"] {
    background: var(--dsw-alias-bg-layer-2) !important;
    --dsw-alias-bg-base: var(--lg-host-base);
    border: 0;
    box-shadow: var(--dsw-elevation-prominent) !important;
  }

  :root[data-liquid-glass] [data-shortcut-modal="settings"]::before {
    display: none;
  }

  :root[data-liquid-glass] [role="presentation"]:has(> [data-shortcut-modal="settings"]) > [aria-hidden="true"] {
    background: var(--dsw-alias-bg-mask-1) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  :root[data-liquid-glass] body {
    --dsw-menu-surface-fill: var(--lg-menu-fallback);
    --dsw-specific-menu: var(--lg-menu-fallback);
    --dsw-menu-backdrop-filter: none;
  }
}

/* ── settings page (rendered inside the host Settings panel) ─────────────── */
.lg-page {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 4px 0 32px;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
}

.lg-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 0;
  border-bottom: 0.5px solid var(--dsw-alias-border-l2);
}

.lg-group:last-child {
  border-bottom: 0;
}

.lg-group-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}

.lg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 32px;
}

.lg-row-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.lg-row-label {
  color: var(--dsw-alias-label-primary);
}

.lg-row-hint {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}

.lg-value {
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 44px;
  text-align: right;
}

.lg-control {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.lg-switch {
  position: relative;
  width: 40px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--dsw-alias-bg-module-platform);
  cursor: pointer;
  transition: background-color 120ms ease;
}

.lg-switch[aria-checked="true"] {
  background: var(--dsw-alias-button-info-fill);
}

.lg-switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 25%);
  transition: transform 120ms ease;
}

.lg-switch[aria-checked="true"]::after {
  transform: translateX(16px);
}

.lg-range {
  width: 180px;
  max-width: 40vw;
  accent-color: var(--dsw-alias-button-info-fill);
}

.lg-segments {
  display: inline-flex;
  padding: 2px;
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: 10px;
  background: var(--dsw-alias-bg-module-platform);
  gap: 2px;
}

.lg-segment {
  padding: 4px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.lg-segment[aria-pressed="true"] {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
}

.lg-button {
  padding: 5px 12px;
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: 9px;
  background: var(--dsw-alias-bg-module-platform);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.lg-button:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

.lg-button-ghost {
  border-color: transparent;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
}

.lg-thumb {
  width: 64px;
  height: 40px;
  border-radius: 8px;
  border: 0.5px solid var(--dsw-alias-border-l3);
  background-size: cover;
  background-position: center;
  background-color: var(--dsw-alias-bg-module-platform);
}

.lg-note {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}

.lg-master {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 0 18px;
}
`

/* ── tiny reactive store ─────────────────────────────────────────────────── */

const store = (() => {
  const listeners = new Set()
  let state = { ...DEFAULTS }

  const read = () => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw !== null) {
        const parsed = JSON.parse(raw)
        if (parsed !== null && typeof parsed === 'object') state = { ...DEFAULTS, ...parsed }
      }
    } catch {
      /* private mode or a corrupt entry: keep defaults */
    }
    return state
  }

  const write = () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state))
    } catch {
      /* quota: the session keeps the value, only persistence is lost */
    }
  }

  // Sliders fire on every pointer tick; persisting (and re-serializing a
  // wallpaper data URL) per tick would jank the drag, so writes are debounced.
  let writeTimer = 0
  const scheduleWrite = () => {
    if (writeTimer !== 0) clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
      writeTimer = 0
      write()
    }, 300)
  }

  const emit = () => {
    for (const listener of listeners) listener(state)
  }

  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch }
      scheduleWrite()
      emit()
      applyState(state)
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    hydrate() {
      read()
      return state
    },
    flush() {
      if (writeTimer !== 0) {
        clearTimeout(writeTimer)
        writeTimer = 0
        write()
      }
    },
  }
})()

/* ── decorative layers ───────────────────────────────────────────────────── */

const layers = {
  ambient: null,
  wallpaper: null,
  wallpaperImage: null,
  whale: null,
  whaleCleanup: null,
  fades: null,
  rim: null,
}

const buildLayers = () => {
  const ambient = document.createElement('div')
  ambient.id = AMBIENT_ID
  ambient.setAttribute('aria-hidden', 'true')
  for (let i = 0; i < 3; i += 1) ambient.appendChild(document.createElement('i'))

  const wallpaper = document.createElement('div')
  wallpaper.id = WALLPAPER_ID
  wallpaper.setAttribute('aria-hidden', 'true')
  const wallpaperImage = document.createElement('div')
  wallpaperImage.id = 'dsh-liquid-glass-wallpaper-image'
  wallpaper.appendChild(wallpaperImage)

  const whale = document.createElement('canvas')
  whale.id = WHALE_ID
  whale.setAttribute('aria-hidden', 'true')

  const fades = document.createElement('div')
  fades.id = FADES_ID
  fades.setAttribute('aria-hidden', 'true')
  const top = document.createElement('i')
  top.dataset.edge = 'top'
  const bottom = document.createElement('i')
  bottom.dataset.edge = 'bottom'
  fades.append(top, bottom)

  layers.ambient = ambient
  layers.wallpaper = wallpaper
  layers.wallpaperImage = wallpaperImage
  layers.whale = whale
  layers.fades = fades

  const rim = document.createElement('div')
  rim.id = 'dsh-liquid-glass-rim'
  rim.setAttribute('aria-hidden', 'true')
  layers.rim = rim
  document.body.append(ambient, wallpaper, whale, fades, rim)
}

/* ── particle whale ──────────────────────────────────────────────────────── */

const whaleParticles = (() => {
  // A stylised whale silhouette, sampled into particle positions once.
  const W = 260
  const H = 150
  const cache = new Map()

  const path = () => {
    const p = new Path2D()
    p.moveTo(24, 84)
    p.bezierCurveTo(28, 52, 62, 36, 104, 40)
    p.bezierCurveTo(140, 43, 166, 58, 182, 74)
    p.bezierCurveTo(166, 82, 150, 88, 138, 100)
    p.bezierCurveTo(112, 116, 66, 114, 42, 100)
    p.bezierCurveTo(30, 93, 25, 88, 24, 84)
    p.closePath()
    // tail
    p.moveTo(182, 74)
    p.lineTo(238, 44)
    p.lineTo(228, 74)
    p.lineTo(238, 104)
    p.closePath()
    return p
  }

  const sample = (stride) => {
    if (cache.has(stride)) return cache.get(stride)
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const g = canvas.getContext('2d')
    if (g === null) return []
    g.fillStyle = '#fff'
    g.fill(path())
    const data = g.getImageData(0, 0, W, H).data
    const points = []
    for (let y = 0; y < H; y += stride) {
      for (let x = 0; x < W; x += stride) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          points.push({ x, y, phase: (x * 0.37 + y * 0.91) % 6.283, drift: 0.5 + ((x * 7 + y * 13) % 10) / 10 })
        }
      }
    }
    cache.set(stride, points)
    return points
  }

  return { W, H, sample }
})()

const mountWhale = (canvas) => {
  const context = canvas.getContext('2d')
  if (context === null) return () => {}
  const points = whaleParticles.sample(4)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let width = 0
  let height = 0
  let frame = 0
  let disposed = false
  let last = 0
  let column = null
  let resize = null
  let retry = 0
  let mutations = null

  const findColumn = () => {
    if (column !== null && column.isConnected) return column
    column = document.querySelector('[class*="centerCol"]')
    if (column !== null && resize !== null) resize.observe(column)
    return column
  }

  const layout = () => {
    const host = findColumn()
    const rect = host === null ? null : host.getBoundingClientRect()
    const box = rect === null || rect.width === 0
      ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
      : rect
    width = Math.min(box.width * 0.62, 620)
    height = width * (whaleParticles.H / whaleParticles.W)
    const left = box.left + (box.width - width) / 2
    const top = box.top + Math.max(40, (box.height - height) / 2 - 60)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    canvas.style.left = Math.round(left) + 'px'
    canvas.style.top = Math.round(top) + 'px'
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const dark = () => document.body.hasAttribute('data-ds-dark-theme')

  // One particle's on-screen position at time t: a travelling body wave, a
  // little per-point wobble, a slow whole-shape swim and a gentle tilt.
  const project = (point, t, scale, swimX, swimY, cos, sin) => {
    const amplitude = Math.max(1.2, scale)
    const wave = Math.sin(t * 1.35 - point.x * 0.055) * 2.6 * amplitude
    const x0 = point.x * scale + Math.sin(t * 1.05 + point.phase) * 1.5 * amplitude
    const y0 = point.y * scale
      + wave * (0.35 + 0.65 * (point.y / whaleParticles.H))
      + Math.cos(t * 0.85 + point.phase) * 1.3 * amplitude
    const dx = x0 - width / 2
    const dy = y0 - height / 2
    return {
      x: width / 2 + dx * cos - dy * sin + swimX,
      y: height / 2 + dx * sin + dy * cos + swimY,
    }
  }

  const draw = (time) => {
    frame = 0
    if (disposed) return
    // Hidden (switch off, reduced transparency): keep the loop alive, draw
    // nothing.
    if (!store.get().whale || canvas.offsetWidth === 0) {
      frame = requestAnimationFrame(draw)
      return
    }
    if (time - last < 32) {
      frame = requestAnimationFrame(draw)
      return
    }
    last = time
    const t = time / 1000
    const scale = width / whaleParticles.W
    const swimX = Math.sin(t * 0.3) * width * 0.09
    const swimY = Math.sin(t * 0.42) * 9
    const rot = Math.sin(t * 0.26) * 0.07
    const cos = Math.cos(rot)
    const sin = Math.sin(rot)
    const darkMode = dark()

    context.clearRect(0, 0, width, height)

    // Halo pass: a soft cloud around the body.
    context.fillStyle = darkMode ? 'rgba(150, 205, 255, 0.1)' : 'rgba(70, 110, 160, 0.09)'
    context.beginPath()
    for (const point of points) {
      const spot = project(point, t, scale, swimX, swimY, cos, sin)
      context.moveTo(spot.x + 2.8, spot.y)
      context.arc(spot.x, spot.y, 2.8, 0, 6.283)
    }
    context.fill()

    // Core pass: every particle twinkles at its own pace.
    context.fillStyle = darkMode ? 'rgba(220, 240, 255, 0.9)' : 'rgba(52, 88, 130, 0.6)'
    context.beginPath()
    for (const point of points) {
      const spot = project(point, t, scale, swimX, swimY, cos, sin)
      const radius = 0.85 + 0.75 * (0.5 + 0.5 * Math.sin(t * 1.8 + point.phase * 2.1))
      context.moveTo(spot.x + radius, spot.y)
      context.arc(spot.x, spot.y, radius, 0, 6.283)
    }
    context.fill()

    frame = requestAnimationFrame(draw)
  }

  layout()
  resize = new ResizeObserver(layout)
  const host = findColumn()
  if (host !== null) resize.observe(host)
  window.addEventListener('resize', layout)
  // The conversation column may mount after the plugin; re-measure when the
  // body's subtree changes until it is there.
  if (host === null) {
    mutations = new MutationObserver(() => {
      if (retry !== 0) return
      retry = requestAnimationFrame(() => {
        retry = 0
        layout()
        if (column !== null && mutations !== null) {
          mutations.disconnect()
          mutations = null
        }
      })
    })
    mutations.observe(document.body, { childList: true, subtree: true })
  }
  frame = requestAnimationFrame(draw)

  return () => {
    disposed = true
    if (resize !== null) resize.disconnect()
    if (mutations !== null) mutations.disconnect()
    window.removeEventListener('resize', layout)
    if (retry !== 0) cancelAnimationFrame(retry)
    if (frame !== 0) cancelAnimationFrame(frame)
  }
}

/* ── applying the state ──────────────────────────────────────────────────── */

const applyState = (state) => {
  const root = document.documentElement
  root.style.setProperty('--lg-blur', state.blur + 'px')
  root.style.setProperty('--lg-frost', String(state.frost))
  root.style.setProperty('--lg-brightness', String(state.brightness))
  root.style.setProperty('--lg-wallpaper-blur', state.imageBlur + 'px')
  root.style.setProperty('--lg-wallpaper-frost', String(state.imageFrost))
  root.setAttribute('data-lg-bg', state.background === 'image' && state.image !== '' ? 'image' : 'fluid')
  root.setAttribute('data-lg-motion', state.motion)
  root.setAttribute('data-lg-whale', state.whale ? 'on' : 'off')
  root.setAttribute('data-lg-fades', state.fades ? 'on' : 'off')

  if (layers.wallpaperImage !== null) {
    if (state.image !== '') layers.wallpaperImage.style.setProperty('--lg-wallpaper', 'url("' + state.image + '")')
    else layers.wallpaperImage.style.removeProperty('--lg-wallpaper')
  }

  if (state.enabled) root.setAttribute(ATTR, '')
  else root.removeAttribute(ATTR)
}

/* ── settings page ───────────────────────────────────────────────────────── */

const defineSettingsPage = (React) => {
  const h = React.createElement

  const Switch = ({ checked, onChange }) =>
    h('button', {
      type: 'button',
      className: 'lg-switch',
      role: 'switch',
      'aria-checked': checked ? 'true' : 'false',
      onClick: () => onChange(!checked),
    })

  const Range = ({ value, min, max, step, onChange }) =>
    h('input', {
      className: 'lg-range',
      type: 'range',
      min,
      max,
      step,
      value,
      onChange: (event) => onChange(Number(event.currentTarget.value)),
    })

  const Row = ({ label, hint, children }) =>
    h('div', { className: 'lg-row' },
      h('div', { className: 'lg-row-text' },
        h('span', { className: 'lg-row-label' }, label),
        hint === undefined ? null : h('span', { className: 'lg-row-hint' }, hint)),
      h('div', { className: 'lg-control' }, children))

  const Segments = ({ value, options, onChange }) =>
    h('div', { className: 'lg-segments', role: 'group' },
      options.map((option) =>
        h('button', {
          key: option.value,
          type: 'button',
          className: 'lg-segment',
          'aria-pressed': value === option.value ? 'true' : 'false',
          onClick: () => onChange(option.value),
        }, option.label)))

  const readImageFile = (file, done) => {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        // Any aspect ratio works (the layer covers and crops); only the long
        // side is capped, both for the blur cost and for the storage quota.
        const max = 1920
        const scale = Math.min(1, max / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const context = canvas.getContext('2d')
        if (context === null) return done(null)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        // WebP keeps a transparent PNG's alpha and is much smaller; a browser
        // without a WebP encoder falls back to a flat white JPEG (JPEG has no
        // alpha, and drawing on a transparent canvas would turn it black).
        let data = ''
        try {
          data = canvas.toDataURL('image/webp', 0.88)
        } catch {
          data = ''
        }
        if (data.slice(0, 15) !== 'data:image/webp') {
          const flat = document.createElement('canvas')
          flat.width = canvas.width
          flat.height = canvas.height
          const flatContext = flat.getContext('2d')
          if (flatContext === null) return done(null)
          flatContext.fillStyle = '#ffffff'
          flatContext.fillRect(0, 0, flat.width, flat.height)
          flatContext.drawImage(canvas, 0, 0)
          try {
            data = flat.toDataURL('image/jpeg', 0.86)
          } catch {
            data = ''
          }
        }
        done(data === '' ? null : data)
      }
      image.onerror = () => done(null)
      image.src = String(reader.result)
    }
    reader.onerror = () => done(null)
    reader.readAsDataURL(file)
  }

  function SettingsPage() {
    const [state, setState] = React.useState(store.get())
    const [imageError, setImageError] = React.useState(false)
    const fileRef = React.useRef(null)

    React.useEffect(() => store.subscribe(setState), [])

    const update = (patch) => store.set(patch)

    return h('div', { className: 'lg-page' },
      h('div', { className: 'lg-master' },
        h('div', { className: 'lg-row-text' },
          h('span', { className: 'lg-row-label' }, '液态玻璃'),
          h('span', { className: 'lg-row-hint' }, '关闭后立即恢复原生界面，插件设置会保留。')),
        h(Switch, { checked: state.enabled, onChange: (enabled) => update({ enabled }) })),

      h('div', { className: 'lg-group' },
        h('div', { className: 'lg-group-title' }, '玻璃'),
        h(Row, { label: '模糊度', hint: '卡片背后内容的模糊半径。' },
          h(Range, { value: state.blur, min: 6, max: 48, step: 1, onChange: (blur) => update({ blur }) }),
          h('span', { className: 'lg-value' }, state.blur + 'px')),
        h(Row, { label: '磨砂度', hint: '卡片底色的不透明度，越大越实。' },
          h(Range, { value: state.frost, min: 0.3, max: 1.6, step: 0.05, onChange: (frost) => update({ frost }) }),
          h('span', { className: 'lg-value' }, Math.round(state.frost * 100) + '%'))),

      h('div', { className: 'lg-group' },
        h('div', { className: 'lg-group-title' }, '背景'),
        h(Row, { label: '背景类型', hint: '流体是内置的活动色场，壁纸使用你自己的图片。' },
          h(Segments, {
            value: state.background,
            options: [{ value: 'fluid', label: '流体' }, { value: 'image', label: '壁纸' }],
            onChange: (background) => update({ background }),
          })),
        h(Row, { label: '动态', hint: '静止会保留配色但不漂移，更省电。' },
          h(Segments, {
            value: state.motion,
            options: [{ value: 'drift', label: '缓缓流动' }, { value: 'still', label: '静止' }],
            onChange: (motion) => update({ motion }),
          })),
        h(Row, { label: '亮度', hint: '50 为原样；深色模式下往左压暗，浅色模式下往右提亮。' },
          h(Range, { value: state.brightness, min: 0, max: 100, step: 1, onChange: (brightness) => update({ brightness }) }),
          h('span', { className: 'lg-value' }, String(state.brightness)))),

      h('div', { className: 'lg-group' },
        h('div', { className: 'lg-group-title' }, '壁纸'),
        h(Row, { label: '图片', hint: imageError ? '这张图片读不出来：请换 JPG / PNG / WebP / GIF 或 SVG。' : '任意比例，铺满并居中裁切；支持 JPG / PNG / WebP / GIF / SVG，最长边会压到 1920px，建议原始文件不超过 5 MB。' },
          h('div', { className: 'lg-thumb', style: state.image ? { backgroundImage: 'url("' + state.image + '")' } : undefined }),
          h('button', { type: 'button', className: 'lg-button', onClick: () => fileRef.current?.click() }, state.image ? '更换' : '选择图片'),
          state.image === '' ? null : h('button', { type: 'button', className: 'lg-button lg-button-ghost', onClick: () => update({ image: '' }) }, '移除'),
          h('input', {
            ref: fileRef,
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' },
            onChange: (event) => {
              const file = event.currentTarget.files?.[0]
              event.currentTarget.value = ''
              if (file === undefined) return
              readImageFile(file, (data) => {
                setImageError(data === null)
                if (data !== null) update({ image: data, background: 'image' })
              })
            },
          })),
        h(Row, { label: '壁纸模糊', hint: '只作用于壁纸图片。' },
          h(Range, { value: state.imageBlur, min: 0, max: 48, step: 1, onChange: (imageBlur) => update({ imageBlur }) }),
          h('span', { className: 'lg-value' }, state.imageBlur + 'px')),
        h(Row, { label: '壁纸磨砂', hint: '在壁纸上盖一层雾，便于读字。' },
          h(Range, { value: state.imageFrost, min: 0, max: 0.9, step: 0.02, onChange: (imageFrost) => update({ imageFrost }) }),
          h('span', { className: 'lg-value' }, Math.round(state.imageFrost * 100) + '%'))),

      h('div', { className: 'lg-group' },
        h('div', { className: 'lg-group-title' }, '细节'),
        h(Row, { label: '粒子鲸鱼', hint: '聊天区中央的粒子水印，深色模式更明显。' },
          h(Switch, { checked: state.whale, onChange: (whale) => update({ whale }) })),
        h(Row, { label: '边缘渐隐', hint: '页面上下各一条很淡的模糊带，内容滚到边缘时融进背景。' },
          h(Switch, { checked: state.fades, onChange: (fades) => update({ fades }) }))),

      h('p', { className: 'lg-note' },
        '启用或关闭插件请到「插件」列表；这里的设置只影响外观，不会改动 DSH 的任何文件。'))
  }

  return SettingsPage
}

/* ── plugin ──────────────────────────────────────────────────────────────── */

window.__ModuleLoader__.load({
  id: '@local/dsh-liquid-glass',
  factory(require) {
    const React = require('react')

    return {
      inject: ['slots'],
      apply(ctx) {
        // 1. the skin itself: stylesheet + decorative layers + settings state
        ctx.effect(() => {
          const root = document.documentElement
          const style = document.createElement('style')
          style.id = STYLE_ID
          style.dataset.plugin = '@local/dsh-liquid-glass'
          style.textContent = CSS
          document.head.appendChild(style)

          store.hydrate()
          buildLayers()
          applyState(store.get())
          const unsubscribe = store.subscribe((state) => applyState(state))
          layers.whaleCleanup = mountWhale(layers.whale)

          return () => {
            store.flush()
            unsubscribe()
            if (layers.whaleCleanup !== null) layers.whaleCleanup()
            layers.whaleCleanup = null
            for (const element of [layers.ambient, layers.wallpaper, layers.whale, layers.fades, layers.rim]) {
              if (element !== null) element.remove()
            }
            layers.ambient = null
            layers.wallpaper = null
            layers.wallpaperImage = null
            layers.whale = null
            layers.fades = null
            layers.rim = null
            root.removeAttribute(ATTR)
            root.removeAttribute('data-lg-bg')
            root.removeAttribute('data-lg-motion')
            root.removeAttribute('data-lg-whale')
            root.removeAttribute('data-lg-fades')
            style.remove()
          }
        }, 'liquid-glass: skin')

        // 2. the pointer specular on the composer card
        ctx.effect(() => {
          let frame = 0
          let x = 0
          let y = 0
          let seat = null
          let lit = null
          const unlight = () => {
            if (lit !== null) {
              lit.style.removeProperty('--lg-mx')
              lit.style.removeProperty('--lg-my')
              lit = null
            }
          }
          const paint = () => {
            frame = 0
            if (seat === null) return
            const card = seat.querySelector('[class*="_card"]')
            if (card === null) return
            const rect = card.getBoundingClientRect()
            if (rect.width === 0) return
            lit = card
            card.style.setProperty('--lg-mx', (x - rect.left).toFixed(0) + 'px')
            card.style.setProperty('--lg-my', (y - rect.top).toFixed(0) + 'px')
          }
          const onPointerMove = (event) => {
            const target = event.target
            seat = target instanceof Element ? target.closest('[data-composer-seat]') : null
            if (seat === null) {
              unlight()
              return
            }
            x = event.clientX
            y = event.clientY
            if (frame === 0) frame = requestAnimationFrame(paint)
          }
          window.addEventListener('pointermove', onPointerMove, { passive: true })
          return () => {
            window.removeEventListener('pointermove', onPointerMove)
            if (frame !== 0) cancelAnimationFrame(frame)
            unlight()
          }
        }, 'liquid-glass: specular')

        // 3. the settings page: its own entry in the Settings navigation
        //    (Settings > 液态玻璃), which is where people look for appearance
        //    options. `close` is the shell's own prop and unused here.
        const SettingsPage = defineSettingsPage(React)
        ctx.effect(() => {
          const dispose = ctx.slots.inject('settings.section', () =>
            ctx.slots.register({
              name: 'settings.section',
              id: 'liquid-glass',
              order: 12,
              label: () => '液态玻璃',
            }, SettingsPage))
          return typeof dispose === 'function' ? dispose : undefined
        }, 'liquid-glass: settings page')
      },
    }
  },
})
