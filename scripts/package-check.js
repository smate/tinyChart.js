import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { tinyChart } from 'tinychart.js';

// Resolve through package exports, so a broken entry or minified artifact fails CI.
const { document } = parseHTML('<div></div>');
const target = document.querySelector('div');
const chart = tinyChart(target, {
  dots: true, series: [{ data: [1, 3, null, 2, 4], color: '#c25938' }],
});
assert.ok(chart.svg.querySelector('pattern'));
assert.equal(chart.svg.querySelectorAll('path').length, 4);
chart.update({ roughness: 0 });
assert.equal(chart.svg.querySelectorAll('path').length, 2);
chart.destroy();
assert.equal(target.children.length, 0);
console.log('Built package export and lifecycle smoke check passed.');
