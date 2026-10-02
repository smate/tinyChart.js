# Design decisions

## One feature, one module

The scope is handwritten line charts. Bars, pies, hatching, tooltips, legends,
fonts, animation, and framework wrappers are not part of the runtime. The supplied
images informed the appearance; their suggested extra rendering techniques were
not treated as requirements. Complexity needs a user benefit and a byte cost.

## SVG instead of canvas

SVG gives us a scalable result, an accessible image name, inspectable paths,
native clipping and patterns, and an element callers can serialize. A dot grid
uses one reusable pattern instead of hundreds of DOM nodes. Canvas would need
more work for pixel ratios, resizing, export, and equivalent accessibility.

The tradeoff is path-string size for large datasets. We subdivide each segment
at roughly eight SVG units, capped at 256 subdivisions per segment. The caller
should downsample dense data. No decimation algorithm is included in the core.

## Small deterministic sketch engine

A seeded 32-bit pseudorandom generator offsets intermediate points perpendicular
to their segment. Actual sample coordinates stay in place (to two decimals).
A thinner, translucent second pass gives the stroke variation. Setting
`roughness: 0` skips both subdivision and the second pass. The same seed, data,
and options produce the same path coordinates. Changing axes or series order
can change random-number consumption and therefore the stroke.

## Modern JavaScript, modest tooling

Native ES modules, destructuring, optional chaining, nullish-safe access, template
literals, and platform APIs keep the implementation direct. We do not use newer
syntax merely to claim novelty, nor add polyfills to support it. esbuild is the
only build tool; LinkeDOM is used only in tests. There is no runtime dependency.

The checked-in lockfile pins tooling. The module can also run directly from
source in a browser. The npm entry exports only the minified ESM artifact;
`sideEffects: false` allows bundlers to remove unused imports.

## Byte budget

The initial bundle measures 3,509 bytes minified, 1,927 bytes gzip, and 1,718 bytes
Brotli. CI enforces 6,500 bytes minified and 3,000 bytes gzip. Compression is
measured in Node using gzip level 9 and default Brotli settings. Compression
results can vary slightly between toolchain versions. These are transfer-size
figures, not memory usage or npm install size.

## Lifecycle

Updates rebuild a small SVG off-DOM, then replace the previous SVG only after
validation succeeds. This keeps error behavior atomic without a virtual DOM,
incremental reconciler, or background listeners. Other host children are untouched.
