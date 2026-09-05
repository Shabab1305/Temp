# Bangabandhu Military Museum — Concept Website

A single-page, parallax-driven concept site for the **Bangabandhu Military Museum**
at Bijoy Sarani, Dhaka.

Design direction: *Cinematic Dark Memorial* — near-black ground, bottle-green and
crimson drawn from the flag, gold hairlines, Fraunces display serif over Inter.

## Running it

No build step, no dependencies. Open `index.html` directly, or serve the folder:

```sh
npx http-server -p 8080
```

## Structure

```
index.html              markup, all inline SVG artwork
assets/css/style.css    design tokens + every section
assets/js/main.js       motion engine (~350 lines, zero dependencies)
```

## Motion

A single `requestAnimationFrame` loop drives everything off one lerped scroll value,
so layers never desynchronise:

- **Hero** — six parallax planes (sky, canvas starfield, sun glow, skyline, the
  National Martyrs' Memorial, foreground armour) at separate depth factors.
- **1971** — a pinned section with a horizontally scrubbing timeline rail, six event
  cards, and a progress rule. Falls back to native swipe/snap under 760px.
- **Galleries** — CSS-grid bento with self-scoped parallax inside each card frame and
  a pointer-tracked 3D tilt.
- **Outdoor** — sticky line-art viewport that swaps illustrations as the text steps
  scroll past.
- **Planetarium** — second twinkling canvas starfield with a drifting dome.
- Reveal-on-scroll, word-by-word statement split, animated counters, scroll-velocity
  marquee, scroll progress bar, film grain.

`prefers-reduced-motion: reduce` disables the lerp, the reveals, the grain and the
tilt; all content stays visible and readable.

## Artwork

Every visual is generated — inline SVG silhouettes and line art (main battle tank,
delta-wing fighter, artillery, patrol craft, the Martyrs' Memorial, a stylised Bijoy
Sarani map), CSS gradients, an SVG noise-turbulence grain, and two canvas starfields.
No external images, so nothing hotlinks or 404s. The only network request is the
Google Fonts stylesheet, and the page degrades to system serif/sans without it.

## Before this goes live

Content is written from public knowledge of the museum and needs verification by the
institution:

- **Opening hours and admission** in the Visit section are plausible placeholders.
- **Planetarium runtime and ticketing** are placeholders.
- Photography of the real galleries and outdoor exhibits should replace the SVG art.

The footer states plainly that this is a concept and not an official publication.
