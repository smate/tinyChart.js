import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { tinyChart } from '../src/index.js';

function fixture(options = {}) {
  const { document } = parseHTML('<html><body><div id="chart"><p>Keep me</p></div></body></html>');
  const target = document.querySelector('#chart');
  const chart = tinyChart(target, { axes: false, roughness: 0, ...options });
  return { document, target, chart, svg: chart.svg };
}

const paths = (svg) => [...svg.querySelectorAll('path')].map((path) => path.getAttribute('d'));
const line = (data, extra = {}) => ({ series: [{ data }], ...extra });

test('renders a responsive, accessible SVG without replacing host content', () => {
  const { target, svg } = fixture(line([1, 3, 2], { label: 'Weekly sales' }));
  assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');
  assert.equal(svg.getAttribute('viewBox'), '0 0 640 320');
  assert.equal(svg.getAttribute('role'), 'img');
  assert.equal(svg.getAttribute('aria-label'), 'Weekly sales');
  assert.equal(svg.querySelector('title').textContent, 'Weekly sales');
  assert.match(svg.getAttribute('style'), /width:100%;height:auto/);
  assert.equal(target.querySelector('p').textContent, 'Keep me');
});

test('maps real samples to the common plot coordinates', () => {
  const { svg } = fixture(line([0, 10, 5], { width: 100, height: 100, padding: 10 }));
  assert.deepEqual(paths(svg), ['M10,90l0,0L50,10L90,50']);
});

test('uses one domain for all series and preserves configurable colors', () => {
  const { svg } = fixture({ width: 100, height: 100, padding: 10, series: [
    { name: 'A', data: [0, 10], color: '#ff0000' },
    { name: 'B', data: [5, 5], color: '#0000ff' },
  ] });
  assert.deepEqual(paths(svg), ['M10,90l0,0L90,10', 'M10,50l0,0L90,50']);
  assert.deepEqual([...svg.querySelectorAll('g[stroke]')].map((g) => g.getAttribute('stroke')),
    ['#ff0000', '#0000ff']);
  assert.equal(svg.querySelector('g[stroke] title').textContent, 'A');
});

test('supports negative values and irregular x values without sorting', () => {
  const { svg } = fixture(line([[8, 10], [0, -10], [2, 0]], {
    width: 100, height: 100, padding: 10,
  }));
  assert.deepEqual(paths(svg), ['M90,10l0,0L10,90L30,50']);
});

test('missing values break strokes instead of joining across gaps', () => {
  const { svg } = fixture(line([0, null, 2, [3, null], 0], {
    width: 100, height: 100, padding: 10,
  }));
  assert.deepEqual(paths(svg), ['M10,90l0,0M50,10l0,0M90,90l0,0']);
});

test('empty, all-missing, flat, single and duplicate points have finite paths', () => {
  for (const data of [[], [null, null], [[0, null]], [5], [5, 5], [[2, 3], [2, 3]]]) {
    const { svg } = fixture(line(data));
    assert.doesNotMatch(svg.outerHTML, /NaN|Infinity|undefined/);
  }
  assert.deepEqual(paths(fixture(line([5])).svg), ['M320,160l0,0']);
  assert.equal(fixture().svg.querySelectorAll('path').length, 0);
});

test('fixed domains override autoscaling and plot clipping is applied', () => {
  const { svg } = fixture(line([0, 10], {
    width: 100, height: 100, padding: 10, xDomain: [0, 2], yDomain: [-10, 10],
  }));
  assert.deepEqual(paths(svg), ['M10,50l0,0L50,10']);
  const clip = svg.querySelector('clipPath');
  assert.equal(svg.querySelector('g').getAttribute('clip-path'), `url(#${clip.id})`);
  assert.equal(clip.querySelector('rect').getAttribute('width'), '80');
});

test('setting explicit domains to undefined restores automatic scaling', () => {
  const { chart } = fixture(line([0, 10], {
    width: 100, height: 100, padding: 10, xDomain: [0, 2], yDomain: [-10, 10],
  }));
  chart.update({ xDomain: undefined, yDomain: undefined });
  assert.deepEqual(paths(chart.svg), ['M10,90l0,0L90,10']);
});

test('strokes reach real samples despite cancellation across large coordinates', () => {
  for (const roughness of [0, 1.2]) {
    const { svg } = fixture(line([[1e20, 0], [0.01, 0]], {
      width: 100, height: 100, padding: 0, roughness,
      xDomain: [0, 1], yDomain: [-1, 1],
    }));
    for (const path of paths(svg)) assert.match(path, /L1,50$/);
  }
});

test('seeded wobble is repeatable, changes with seed, and hits real samples', () => {
  const options = line([0, 10, 5], { roughness: 3, seed: 7, width: 100, height: 100, padding: 10 });
  const a = paths(fixture(options).svg);
  assert.deepEqual(a, paths(fixture(options).svg));
  assert.notDeepEqual(a, paths(fixture({ ...options, seed: 8 }).svg));
  assert.equal(a.length, 2);
  for (const path of a) {
    assert.match(path, /^M10,90/);
    assert.match(path, /L50,10L/);
    assert.match(path, /L90,50$/);
  }
  assert.notEqual(a[0], a[1]);
});

test('dots and axes are optional and SVG references are isolated between charts', () => {
  const a = fixture({ dots: true, axes: true });
  const b = tinyChart(a.target, { dots: true, axes: false, roughness: 0 });
  assert.notEqual(a.svg.querySelector('pattern').id, b.svg.querySelector('pattern').id);
  assert.equal(paths(a.svg).length, 1);
  assert.equal(fixture().svg.querySelector('pattern'), null);
});

test('chart labels and series names are text, never interpreted as HTML', () => {
  const label = '<script>alert(1)</script>';
  const { svg } = fixture({ label, series: [{ data: [1, 2], name: label }] });
  assert.equal(svg.querySelector('script'), null);
  assert.equal(svg.querySelector('title').textContent, label);
  assert.equal(svg.getAttribute('aria-label'), label);
});

test('update merges options, replaces SVG and keeps references isolated', () => {
  const { chart, target, svg } = fixture(line([1, 2], { dots: true }));
  chart.update({ series: [{ data: [2, 1], color: 'red' }] });
  assert.notEqual(chart.svg, svg);
  assert.equal(svg.parentNode, null);
  assert.equal(target.querySelectorAll('svg').length, 1);
  assert.ok(chart.svg.querySelector('pattern'));
  assert.notDeepEqual(paths(chart.svg), paths(svg));
  assert.equal(chart.svg.querySelector('g[stroke]').getAttribute('stroke'), 'red');
});

test('failed update preserves previous DOM and configuration', () => {
  const { chart, svg } = fixture(line([1, 2]));
  assert.throws(() => chart.update({ width: -1, dots: true }), /width/);
  assert.equal(chart.svg, svg);
  chart.update({ label: 'Still valid' });
  assert.equal(chart.svg.querySelector('pattern'), null);
  assert.equal(chart.svg.getAttribute('viewBox'), '0 0 640 320');
});

test('overflowing segments fail atomically even after rendering another series', () => {
  const data = [[0, 0], [0.5, 0.5]];
  for (const roughness of [0, 1.2]) {
    const { chart, target, svg } = fixture(line(data, {
      width: 2, height: 2, padding: 0, roughness,
      xDomain: [-1, 1], yDomain: [-1, 1],
    }));
    const originalPaths = paths(svg);
    assert.throws(() => chart.update({ dots: true, series: [
      { data }, { data: [[-Number.MAX_VALUE, 0], [Number.MAX_VALUE, 0]] },
    ] }), TypeError);
    assert.equal(chart.svg, svg);
    assert.equal(target.querySelectorAll('svg').length, 1);
    chart.update({ label: 'Still valid' });
    assert.equal(chart.svg.querySelector('pattern'), null);
    assert.deepEqual(paths(chart.svg), originalPaths);
  }
});

test('destroy is idempotent and does not affect siblings', () => {
  const { chart, target } = fixture(line([1, 2]));
  const other = tinyChart(target);
  chart.destroy(); chart.destroy();
  assert.equal(target.querySelector('svg'), other.svg);
  assert.ok(target.querySelector('p'));
  assert.throws(() => chart.update(), /destroyed/);
});

test('does not mutate caller data or options', () => {
  const point = Object.freeze([1, 2]);
  const options = Object.freeze({ series: Object.freeze([
    Object.freeze({ data: Object.freeze([point, null, 4]) }),
  ]) });
  const { target } = fixture();
  assert.doesNotThrow(() => tinyChart(target, options));
});

test('selector targets work and missing targets fail clearly', () => {
  const { document } = parseHTML('<div id="target"></div>');
  const previous = globalThis.document;
  globalThis.document = document;
  try {
    assert.ok(tinyChart('#target').svg);
    assert.throws(() => tinyChart('#missing'), /target must be an element/);
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});

test('rejects non-element targets before calling their append method', () => {
  const { document } = parseHTML('<div></div>');
  let appends = 0;
  const fake = { ownerDocument: document, appendChild() { appends++; } };
  for (const target of [document.createDocumentFragment(), document.createTextNode('text'), fake]) {
    assert.throws(() => tinyChart(target), /target must be an element/);
  }
  assert.equal(appends, 0);
});

test('invalid data is rejected before appending DOM', () => {
  for (const data of [[NaN], [Infinity], [undefined], ['2'], [[1]], [[1, 2, 3]], [[null, 2]], [{}]]) {
    const { document } = parseHTML('<div></div>');
    const target = document.querySelector('div');
    assert.throws(() => tinyChart(target, line(data)), /points must/);
    assert.equal(target.children.length, 0);
  }
});

test('sparse data and series arrays are rejected before appending DOM', () => {
  for (const options of [line(Array(1)), line([1, , 2]), { series: Array(1) },
    { series: [{ data: [1, 2] }, , { data: [2, 3] }] }]) {
    const { document } = parseHTML('<div></div>');
    const target = document.querySelector('div');
    assert.throws(() => tinyChart(target, options), TypeError);
    assert.equal(target.children.length, 0);
  }
});

test('invalid dimensions, domains and options fail clearly', () => {
  for (const options of [
    { width: 0 }, { height: Infinity }, { padding: -1 }, { padding: 200 },
    { strokeWidth: 0 }, { dotSpacing: 0 }, { roughness: NaN }, { roughness: 11 },
    { seed: 1.2 }, { series: null }, { series: [{}] },
    { xDomain: [1, 1] }, { yDomain: [2, 1] }, { xDomain: [0, Infinity] },
    { xDomain: [0, 1, 2] }, { yDomain: [-Number.MAX_VALUE, Number.MAX_VALUE] },
  ]) assert.throws(() => fixture(options), TypeError);
});

test('flags, paints and accessible labels require their documented types', () => {
  for (const key of ['axes', 'dots']) {
    for (const value of [0, 1, 'false', null, undefined, {}]) {
      assert.throws(() => fixture({ [key]: value }), TypeError, key);
    }
  }
  for (const key of ['color', 'dotColor', 'label']) {
    for (const value of [0, false, null, undefined, {}, []]) {
      assert.throws(() => fixture({ [key]: value }), TypeError, key);
    }
  }
  for (const key of ['color', 'name']) {
    for (const value of [0, false, null, {}, []]) {
      assert.throws(() => fixture({ series: [{ data: [0, 1], [key]: value }] }), TypeError, key);
    }
  }
  const { svg } = fixture({ series: [{ data: [0, 1], color: undefined, name: undefined }] });
  assert.equal(svg.querySelector('g[stroke]').getAttribute('stroke'), '#262521');
  assert.equal(svg.querySelector('g[stroke] title'), null);
});

test('nonzero constant domains reject an underflowing five-percent expansion', () => {
  for (const value of [Number.MIN_VALUE, -Number.MIN_VALUE]) {
    assert.throws(() => fixture(line([value])), TypeError);
    assert.throws(() => fixture(line([[value, 1]])), TypeError);
  }
});
