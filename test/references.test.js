import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let copy = 0;
const loadCopy = async () => (await import(`../src/index.js?references=${++copy}`)).tinyChart;
const documentFixture = () => parseHTML('<html><body><div id="chart"></div></body></html>').document;
const options = { axes: false, roughness: 0, dots: true };

function assertUniqueReferences(root, svg) {
  const clip = svg.querySelector('clipPath');
  const pattern = svg.querySelector('pattern');
  assert.equal(svg.querySelector('g[clip-path]').getAttribute('clip-path'), `url(#${clip.id})`);
  assert.equal(svg.querySelector('rect[fill]').getAttribute('fill'), `url(#${pattern.id})`);
  for (const resource of [clip, pattern]) {
    const matches = [...root.querySelectorAll('[id]')].filter((node) => node.id === resource.id);
    if (root.id === resource.id) matches.push(root);
    assert.deepEqual(matches, [resource], `resource ${resource.id} must be unique within its tree`);
  }
}

test('independent module copies isolate references in the same document', async () => {
  const [first, second] = await Promise.all([loadCopy(), loadCopy()]);
  const document = documentFixture();
  const target = document.querySelector('#chart');
  const a = first(target, { ...options, dotSpacing: 10 });
  const b = second(target, { ...options, width: 100, height: 100, padding: 10, dotSpacing: 30 });
  assertUniqueReferences(document, a.svg);
  assertUniqueReferences(document, b.svg);
});

test('pre-existing pattern and clip IDs are preserved without collisions', async () => {
  const tinyChart = await loadCopy();
  const document = documentFixture();
  const target = document.querySelector('#chart');
  target.innerHTML = '<svg><defs><pattern id="tinychart-1"></pattern><clipPath id="tinychart-2-clip"></clipPath></defs></svg>';
  const existing = target.firstElementChild;
  const chart = tinyChart(target, options);
  assert.equal(existing.parentNode, target);
  assertUniqueReferences(document, chart.svg);
});

test('updates avoid IDs retained by a copy of the previous SVG', async () => {
  const tinyChart = await loadCopy();
  const document = documentFixture();
  const target = document.querySelector('#chart');
  const chart = tinyChart(target, options);
  const previous = chart.svg;
  const clone = previous.cloneNode(true);
  target.append(clone);
  chart.update({ width: 200 });
  assert.equal(previous.parentNode, null);
  assert.equal(clone.parentNode, target);
  assertUniqueReferences(document, clone);
  assertUniqueReferences(document, chart.svg);
});

test('shadow-tree resources are included when allocating IDs', async () => {
  const tinyChart = await loadCopy();
  const document = documentFixture();
  const root = document.querySelector('#chart').attachShadow({ mode: 'open' });
  root.innerHTML = '<div><svg><defs><pattern id="tinychart-1"></pattern><clipPath id="tinychart-2-clip"></clipPath></defs></svg></div>';
  const chart = tinyChart(root.querySelector('div'), options);
  assertUniqueReferences(root, chart.svg);
});

test('detached hosts avoid their root ID and resources in their destination document', async () => {
  const tinyChart = await loadCopy();
  const document = documentFixture();
  document.querySelector('#chart').innerHTML = '<svg><defs><pattern id="tinychart-3"></pattern></defs></svg>';
  const target = document.createElement('div');
  target.id = 'tinychart-1';
  target.innerHTML = '<svg><defs><clipPath id="tinychart-2-clip"></clipPath></defs></svg>';
  const chart = tinyChart(target, options);
  assertUniqueReferences(target, chart.svg);
  document.body.append(target);
  assertUniqueReferences(document, chart.svg);
});

test('independent copies created in separate detached hosts remain isolated after insertion', async () => {
  const [first, second] = await Promise.all([loadCopy(), loadCopy()]);
  const document = documentFixture();
  const a = document.createElement('div');
  const b = document.createElement('div');
  const chartA = first(a, options);
  const chartB = second(b, options);
  document.body.append(a, b);
  assertUniqueReferences(document, chartA.svg);
  assertUniqueReferences(document, chartB.svg);
});
