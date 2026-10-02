# Working in tinyChart.js

- Keep the runtime vanilla JavaScript, ESM-only, with zero dependencies.
- The sole chart type is a handwritten line chart. Keep additions within scope.
- Preserve the 3,000-byte gzip and 6,500-byte minified budgets. Do not increase
  limits without an explicit product decision.
- Read `docs/api.md` before changing public behavior. Update docs and changelog
  alongside user-visible changes.
- Run `npm run check` for runtime or packaging changes. Check the examples in a
  browser when visual behavior changes.
- Keep generated files, npm tarballs, and test screenshots out of Git.
- Keep this repository local unless the user asks to publish or add a remote.
- Update `tasks/README.md` with completed work and actual verification evidence.
