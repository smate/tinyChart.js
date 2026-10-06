# Changelog

## Unreleased — 0.1.0

- Removed the internal task directory and its Git history; updated documentation links.

- Initial dependency-free ES module for handwritten SVG line charts.
- Multiple series and colors, optional dotted background and axes.
- Seeded sketch strokes, shared linear domains, explicit x/y pairs and gaps.
- Responsive output, accessible labels, update and destroy methods.
- Interactive playground and minimal examples.
- Behavior tests, package smoke check, CI, and enforced byte budgets.
- Fixed SVG resource ID collisions across module copies, host content, detached
  containers, shadow trees and updates.
- Fixed endpoint precision loss and rejected overflowing segment geometry before
  replacing chart content.
- Enforced documented target and option types, rejected sparse data/series arrays,
  and fixed constant-domain expansion when very small nonzero values underflow.
- Added regression coverage for these fixes, automatic-domain restoration and
  failed-update atomicity; corrected sorting and reference-isolation tests.

No public release has been published.
