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
