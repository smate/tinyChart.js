# Initial verification — 2026-10-02

## Automated checks

- `npm run check`: 17 Node tests passed, minified build succeeded, size budgets
  passed, and the built package export/lifecycle smoke check passed.
- Bundle: **3,509 bytes minified / 1,927 bytes gzip / 1,718 bytes Brotli**.
- `npm pack --dry-run --ignore-scripts`: six expected files, about 9.4 KB packed.
  Only the ESM artifact, source, API docs, README, license, and package manifest ship.
- Installed the local tarball into `output/consumer` and imported its
  `tinychart.js` package export successfully. Nothing was published.
- `npm install` reported zero known dependency vulnerabilities at setup time.

## Browser checks

Chromium 154 on macOS, driven with Playwright:

- Playground rendered a responsive SVG with two independently colored series.
- New seed changed strokes; dots, axes, and second-series switches worked.
- Zero roughness reduced the plot to one precise stroke; color changes applied.
- Expandable data table exposed seven rows.
- At 390 × 844, document width remained 390 px and the chart fit its container.
- Four minimal examples rendered without nonfinite path coordinates.
- The minified ESM artifact rendered, updated, and destroyed a chart in-browser.
- Accessible chart image names were present in browser snapshots.
- No browser console errors or warnings were recorded.

Desktop, mobile, and minimal-example screenshots are generated local artifacts
under `output/playwright/` and are intentionally excluded from Git.

## Still to verify before public release

Firefox and Safari/WebKit, full assistive-technology review, a hosted CI run, and
public package installation remain release tasks. Browser support is a target,
not a claim that every engine has already been tested. Maintainer review of the
visual defaults and final package identity is also pending.

## Source and test review — 2026-10-02

Reviewed every file in `src/` and `test/` against the API contract. Regression
cases reproduced sparse data being accepted, non-element targets being accepted,
incorrect option types being coerced, endpoint precision loss, nonfinite segment
paths, underflowing constant-domain expansion and colliding SVG resource IDs.
The fixes preserve failed-update atomicity and the dependency-free ESM runtime.

- `npm run check`: **30 tests passed**, minified build and byte budgets passed,
  and the built package export/lifecycle smoke check passed.
- Bundle: **4,055 bytes minified / 2,140 bytes gzip / 1,917 bytes Brotli**;
  limits remain 6,500 bytes minified and 3,000 bytes gzip.
- Reference regressions cover separate module copies, existing host IDs, shadow
  trees, detached hosts, insertion into a shared document and updates.
- Numeric probing of 169 extreme two-point combinations produced 125 finite
  renders and 44 expected `TypeError` rejections, with no nonfinite paths.
- `git diff --check` passed. Build output and browser artifacts remain ignored.
- Chromium **154.0.8037.95**: reloaded the playground after the fixes and checked
  dots, axes, multiple series, roughness and color controls. At 390 px viewport
  width, document width remained 390 px and the SVG retained its aspect ratio.
- Visually inspected desktop/mobile playground screenshots and all four minimal
  examples, including the gap, round single point and clean sparkline. No
  nonfinite path coordinates or console errors were observed in these examples.
- Fresh source and built-module imports coexist with unique, resolving pattern
  and clip references; reserved document/shadow IDs and detached hosts passed.
  Endpoint precision and overflowing failed-update atomicity passed with both
  zero and nonzero roughness. Tiny constant domains rejected before append.
- Rasterized a zero-length single-point stroke and verified its center pixel was
  opaque series ink (`[194, 89, 56, 255]`). The final browser console contained
  **zero errors, warnings or other messages**.
- Final screenshots are ignored local artifacts in `output/playwright/`:
  `playground-desktop-final.png`, `playground-mobile-final.png`, `minimal-final.png`
  and `module-regressions-final.png`. The reproducible browser checks are saved
  locally as `output/playwright/runtime-regressions.js`.

## GitHub upload — 2026-10-06

- User created `smate/tinyChart.js` and authorized uploading the local project.
- Added real repository, homepage and issue URLs to package metadata and updated
  the README's measured sizes. `npm run check` passed all 30 tests, build, size
  budgets and the built-package smoke check after these changes.
- After the user registered the prepared SSH key, `git push -u origin main`
  succeeded. Local `main` now tracks `origin/main`.
- Uploaded source, tests, documentation, MIT license, issue templates and the
  Node 22/24 CI workflow. Generated artifacts remain excluded. The npm package
  stays unpublished with `private: true`.
- [GitHub CI run 37429608954](https://github.com/smate/tinyChart.js/actions/runs/37429608954)
  completed successfully on commit `cac4b3f`: both `check (22)` and `check (24)`
  passed, including tests, build, size budgets, package smoke check and package
  dry-run inspection.
