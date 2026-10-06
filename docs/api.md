# API

## `tinyChart(target, options?)`

Named ES module export. `target` is a DOM element or CSS selector. Selectors are
resolved with the current global `document`; a passed element uses its own
`ownerDocument`. The chart appends one SVG and preserves existing host content.
An invalid selector throws a browser selector error; a missing element or a
non-element target (including a text node or document fragment) throws `TypeError`.

```js
const chart = tinyChart(document.querySelector('#chart'), {
  series: [{ data: [1, 5, 3], color: '#c25938' }],
});
```

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `series` | `[]` | Array of `{ data, color?, name? }` objects. |
| `width` | `640` | Positive finite SVG coordinate width. |
| `height` | `320` | Positive finite SVG coordinate height. |
| `padding` | `24` | Nonnegative uniform inset; must leave a positive plot area. |
| `strokeWidth` | `2.5` | Positive finite line and axis width, in SVG units. |
| `roughness` | `1.2` | Wobble amount from `0` to `10`; zero draws a single clean stroke. |
| `seed` | `1` | Integer, converted to an unsigned 32-bit seed for repeatable strokes. |
| `color` | `'#262521'` | Default series and axis color; any SVG paint value. |
| `axes` | `true` | Draw the left and bottom plot borders (not zero-value axes). |
| `dots` | `false` | Draw a dotted pattern over the entire SVG background. |
| `dotSpacing` | `20` | Positive finite spacing, in SVG units. |
| `dotColor` | `'#d4d0c8'` | SVG paint value for the dots. |
| `label` | `'Line chart'` | Descriptive string for the SVG title and accessible name. |
| `xDomain` | Automatic | Optional `[min, max]`, both finite, with `min < max`. |
| `yDomain` | Automatic | Optional `[min, max]`, both finite, with `min < max`. |

Pass booleans for `axes` and `dots`, strings for colors, labels and optional series
names, and finite numbers where specified. Invalid types throw `TypeError`;
optional series colors and names may be omitted or `undefined`. Unknown options
are ignored. Numeric ranges and data are validated; paint strings are passed to
SVG for interpretation. Use solid CSS colors when handling untrusted paint input,
since SVG also supports URL paints.

SVG resource IDs stay distinct within each document and shadow tree, including
when separate module copies create charts in detached hosts. Existing host IDs
are preserved.

The SVG uses `width: 100%; height: auto` and a fixed `viewBox`, so it follows its
container's width while keeping its aspect ratio. All visual units, including
strokes and dots, scale together. No resize listener is installed. For a new
aspect ratio, call `update({ width, height })`.

### Data

```js
// Equally spaced x coordinates: index 0, 1, 2, …
{ data: [2, 7, 4], color: '#567569', name: 'Revenue' }

// Explicit x coordinates: irregular intervals are supported.
{ data: [[0, 2], [2, 7], [10, 4]] }

// Null breaks the line; it does not connect across the missing sample.
{ data: [2, null, 4, 6] }
{ data: [[0, 2], [2, null], [10, 4], [11, 6]] }
```

- All series share linear x/y domains. Samples are connected in input order;
  sort the data yourself if needed. Dates must be converted to numbers.
- Automatic domains use the smallest and largest defined coordinates.
  `[x, null]` contributes x to the domain; a bare `null` contributes neither
  coordinate. Subsequent numeric samples retain their original array indices.
- Constant domains are expanded by 5% of their absolute value, or by 1 for zero.
  An empty domain falls back to `[0, 1]`.
- Empty and all-null series draw no marks. A single point is rendered as a round
  dot through a zero-length stroke. Duplicated coordinates are allowed.
- Explicit domains clip data to the plot rectangle. Strokes centered on a plot
  edge are partially clipped; leave domain headroom if you want full endpoints.
- `NaN`, infinity, strings, `undefined`, sparse array holes, and malformed tuples
  throw `TypeError`. The series array must also have no holes.
- Extreme domain ranges, scaled coordinates or segment lengths that cannot remain
  finite throw `TypeError`. Constant nonzero domains whose 5% expansion underflows
  also throw; supply an explicit domain to plot such tiny values.
- The library reads but does not mutate data. It keeps references to the supplied
  arrays, so treat them as immutable and pass replacements on update.
- Wobble is added perpendicular to each segment, only between data samples.
  Each real sample uses its scaled coordinate directly, rounded to two decimals.
  This is a sketch effect, not a smoothing or trend-fitting algorithm.

### Returned handle

`chart.svg` is a getter for the current SVG element.

`chart.update(patch = {})` shallow-merges options and renders a replacement SVG.
Supplying `series` replaces the whole series array. Setting `xDomain` or
`yDomain` to `undefined` restores automatic scaling. A failed render leaves the
previous SVG and configuration intact. Updates return `undefined`; they are not
chainable. Use the getter again after update, since a saved SVG reference is stale.

`chart.destroy()` removes only this chart's SVG. Calling it again is harmless.
Updating a destroyed chart throws `TypeError`. The chart installs no event
listeners, timers, or observers that need separate cleanup.

### Accessibility

Provide a useful `label` explaining what the chart shows. Each series may have
an optional `name`, inserted as a text-only SVG title. A single image label does
not expose every sample to a screen reader. Supply a visible legend and a data
table or textual description for meaningful data, as the playground does. Use
adequate contrast; colors alone should not convey essential distinctions.

### Support

The output targets ES2022 and modern browsers with SVG and native ES modules.
There is no legacy browser, TypeScript, CommonJS, or server-rendering build. Node
is needed only for development and building. See [tasks](../tasks/README.md) for
the browser compatibility checks still required before public release.
