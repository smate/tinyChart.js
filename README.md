# tinyChart.js

**Little line charts that look like you drew them.**

Vanilla JavaScript. Responsive SVG. Zero runtime dependencies. **2,140 bytes gzip**
(4,055 bytes minified; measured with the pinned build tools). No fonts, stylesheets,
frameworks, or drawing engines to download.

- A repeatable, hand-drawn stroke; set `roughness: 0` for a clean line.
- Multiple series, each with its own color.
- Optional dotted paper and simple left/bottom axes.
- Numeric or `[x, y]` data, missing-value gaps, shared scales, and fixed domains.
- Small `update()` / `destroy()` API and accessible SVG labels.

This is a **pre-release 0.1.0 project** hosted on
[GitHub](https://github.com/smate/tinyChart.js), not yet published to npm. The provisional npm
name is `tinychart.js`; it has not been reserved. Publishing is disabled with
`private: true` until the [release checklist](docs/releasing.md) is complete.

## Try it locally

Use Node.js 22 or newer (Node 24 is the recommended development version).

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173> for the interactive playground. The
[minimal examples](examples/minimal.html) show a single line, multiple lines,
irregular x coordinates, gaps, a flat series, and a precise sparkline.

## Use it

Copy `src/index.js` into your project and import it directly, or build a local npm
tarball with `npm pack` and install that file in another project. The following
package import works after installing the local tarball; it does **not** require
publishing anything.

```html
<div id="chart"></div>
```

```js
import { tinyChart } from 'tinychart.js';

const chart = tinyChart('#chart', {
  label: 'Ideas and coffees over the last seven days',
  dots: true,
  series: [
    { name: 'Ideas', data: [18, 64, 32, 45, 24, 77, 54], color: '#c25938' },
    { name: 'Coffees', data: [9, 28, 20, 40, 31, 49, 38], color: '#567569' },
  ],
});

chart.update({ roughness: 2, seed: 7 });
chart.svg; // Current SVG element; useful for export or inspection.
chart.destroy();
```

For a browser without a bundler, use a module script and a relative import such
as `import { tinyChart } from './tinychart.js'`. Serve files over HTTP. There is no
global variable or CommonJS build.

## Stay tiny

The entire library is a single JavaScript module. We use standard ES modules,
modern syntax, native DOM/SVG APIs, and no polyfills. Development tools do not
ship to consumers. The [esbuild build](https://esbuild.github.io/api/) targets
ES2022. Rendering requires a browser DOM; importing the module does not.

`npm run size` enforces **3,000 bytes gzip** and **6,500 bytes minified**. These are
decimal byte limits for the JavaScript bundle, not the npm tarball or generated
SVG. SVG complexity grows with your data; this is intended for small charts,
not millions of points. Dense datasets should be downsampled by the caller.

Legends, tick labels, tooltips, animation, date formatting, and other chart types
are intentionally outside the core. Put labels and legends in HTML, as in the
playground. No remote font or other network request is made by the library.

## Develop

```sh
npm test          # Behavior and edge cases using Node's test runner
npm run build     # Minified ES module in dist/tinychart.js
npm run size      # Raw, gzip and Brotli sizes; enforce budgets
npm run check     # Tests, build, size, and built-package smoke check
npm pack --dry-run # Inspect exactly what would ship
```

- [API and defaults](docs/api.md)
- [Design decisions](docs/design.md)
- [Implementation and release tasks](tasks/README.md)
- [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE), copyright © 2026 tinyChart.js contributors.
