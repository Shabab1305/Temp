# Bangladesh Military Museum — Concept Website

A single-page, parallax-driven concept site for the **Bangladesh Military Museum**
at Bijoy Sarani, Tejgaon, Dhaka 1215.

> **On the name.** The museum was established in 1987 as the Bangladesh Military
> Museum, was renamed the Bangabandhu Military Museum for the 2022 reopening, and
> reverted to *Bangladesh Military Museum* after August 2024. The current name is
> used throughout, matching the official site at `bangladeshmilitarymuseum.org`.

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

## Where the content came from

Facts were gathered from the museum's own site (`bangladeshmilitarymuseum.org`, via
its indexed `/visit`, `/contact` and `/history` pages), Wikipedia, and contemporary
reporting in The Business Standard, The Financial Express, Dhaka Tribune and
Prothom Alo. Direct fetching of those pages was blocked by the network policy of the
environment this was built in, so everything below should be re-checked against the
live site before launch.

Used on the page:

- Established 1987 at Mirpur Cantonment; moved 1992 to Bijoy Sarani beside the
  planetarium; the ten-acre purpose-built complex opened January 2022.
- Three wings (Army, Navy, Air Force) around a central plaza with escalators.
  Ground floor: information, utility, and the entrances to the Toshakhana Museum
  (five storeys) and the Victory Arena. Basement: Navy. First floor: Army.
  Second floor: Air Force. Mezzanine: UN peacekeeping and the Chittagong Hill Tracts.
- Galleries: Bangladesh History, Army, Navy, Air Force, UN Peacekeeping.
- Outdoor: tanks and armoured vehicles including a captured T-54 that still shows
  its combat damage; anti-aircraft guns, transports, aircraft and naval craft.
- Architects: Ali Imam and Bayejid Mahbub Khondker with Nakshabid Architects,
  Design Work Group, Mukta Dinwiddie MacLaren Architects and Foster Lomas
  Architects; exhibition design by Real Studios.
- Hours: two sessions daily, 10:00–13:00 and 15:00–18:00; Friday afternoon only;
  closed Wednesdays and national holidays.
- Admission: Tk 100 Bangladeshi, Tk 300 SAARC, Tk 500 other foreign nationals,
  free for children five and under. Online booking up to three days ahead.
- Contact: +880 2 9870011, +880 1769 017770, milmuseum.bd@gmail.com.

## Still to verify or replace

- **Hours and prices** are the most volatile facts here and were read from cached
  search results, not the live pages. Confirm before launch.
- **The planetarium next door** is a separate institution on the adjoining site, not
  part of the museum. The page says so; don't let it drift back into the museum's
  own facilities list.
- **Photography** of the real galleries and outdoor exhibits should replace the SVG
  art. The specific vehicles in the outdoor section are described generically apart
  from the T-54, because the full inventory isn't published.
- **Bengali** copy is not included — the build was scoped to English only.

The footer states plainly that this is a concept and not an official publication.
