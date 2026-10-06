# Release checklist

The project is hosted on [GitHub](https://github.com/smate/tinyChart.js) and remains
unpublished on npm. `private: true` intentionally prevents npm
publishing ([npm package.json documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#private)).
Local `npm pack` still works. Do not remove the flag just to run examples.

Before a public release:

- [ ] Complete compatibility checks in Chromium, Firefox and Safari/WebKit,
  including gaps, single points, clipping, resize, keyboard controls and accessible names.
- [ ] Review the API and visual defaults with the maintainer.
- [ ] Confirm the npm name and account ownership. A registry lookup returned 404
  for `tinychart.js` on 2026-10-02; that is not a reservation or a guarantee that
  npm will allow publication under that name.
- [ ] Confirm the copyright notice and maintainer identity.
- [x] With user authorization, create the remote repository and add real
  `repository`, `homepage`, and `bugs` package metadata.
- [ ] Configure a private vulnerability-reporting channel and conduct contact;
  update `SECURITY.md` and `CODE_OF_CONDUCT.md`.
- [ ] Check out a clean working tree and run `npm ci` then `npm run check`.
- [ ] Run `npm pack --dry-run` and inspect the allowlisted contents.
- [ ] Run `npm pack`, install the tarball into a separate consumer app, and check
  the built package in a real browser. No source-relative imports in that test.
- [ ] Record final sizes and browser versions. Update README and design notes if
  sizes changed. Date the changelog and select the release version.
- [ ] Remove `private: true` only when publication has been explicitly requested.
- [ ] Commit, tag, and publish using the maintainer's approved npm authentication
  flow. Never commit credentials. Prefer provenance when the publishing setup
  supports it.
- [ ] Verify the installed registry package and its documented example, then
  publish release notes and update the verification notes.

The GitHub remote and CI workflow are configured. No npm release workflow or
publishing credential is configured by this setup.
