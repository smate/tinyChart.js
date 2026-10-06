# Contributing

Thanks for helping keep tinyChart.js small and useful. The repository is hosted
at [smate/tinyChart.js](https://github.com/smate/tinyChart.js).

1. Use Node 22 or newer; `.nvmrc` selects Node 24. Run `npm ci`.
2. Make a focused branch and change. Use plain JavaScript and ES modules.
3. Add behavior tests for bugs or changes to the data/rendering contract.
4. Run `npm run check`. Open `npm run dev` and check the affected example on a
   desktop and narrow screen when rendering changes.
5. Update API docs and `CHANGELOG.md` for user-visible changes. Include the new
   minified/gzip size and any browser testing in the pull request.

Use two-space indentation, LF endings, semicolons, and single-quoted JavaScript
strings. Keep comments focused on intent. Avoid runtime dependencies and broad
refactors in unrelated fixes. Build output and screenshots are not committed.

Before proposing features, read [design decisions](docs/design.md) and the
[task backlog](tasks/README.md). Line charts are the entire scope. HTML outside
the library is often the best place for application-specific controls and labels.

Report bugs with a minimal dataset, options, browser version, expected behavior,
and what happened. Do not put credentials or private datasets into examples.
See [SECURITY.md](SECURITY.md) for sensitive reports.

All contributions are made under the project's [MIT license](LICENSE). Be
respectful and follow our [code of conduct](CODE_OF_CONDUCT.md).
