const NS = 'http://www.w3.org/2000/svg';
const ID = Symbol.for('tinyChart.id');

const defaults = {
  width: 640,
  height: 320,
  padding: 24,
  strokeWidth: 2.5,
  roughness: 1.2,
  seed: 1,
  color: '#262521',
  axes: true,
  dots: false,
  dotSpacing: 20,
  dotColor: '#d4d0c8',
  label: 'Line chart',
  series: [],
};

const assert = (condition, message) => {
  if (!condition) throw new TypeError(`tinyChart: ${message}`);
};

const number = Number.isFinite;

/** Create a responsive SVG line chart. See docs/api.md for the full contract. */
export function tinyChart(target, options = {}) {
  if (typeof target === 'string') target = document.querySelector(target);
  assert(target?.nodeType === 1 && typeof target.appendChild === 'function'
    && target.ownerDocument, 'target must be an element');
  const doc = target.ownerDocument;
  let config = { ...defaults, ...options };
  let alive = true;

  const node = (name, attrs = {}, text) => {
    const element = doc.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const render = (o) => {
    const { width, height, padding, strokeWidth, roughness, dotSpacing } = o;
    for (const key of ['width', 'height', 'strokeWidth', 'dotSpacing']) {
      assert(number(o[key]) && o[key] > 0, `${key} must be positive and finite`);
    }
    assert(number(padding) && padding >= 0 && padding * 2 < Math.min(width, height),
      'padding must leave a positive plot area');
    assert(number(roughness) && roughness >= 0 && roughness <= 10,
      'roughness must be between 0 and 10');
    assert(Number.isInteger(o.seed), 'seed must be an integer');
    for (const key of ['axes', 'dots']) {
      assert(typeof o[key] === 'boolean', `${key} must be a boolean`);
    }
    for (const key of ['color', 'dotColor', 'label']) {
      assert(typeof o[key] === 'string', `${key} must be a string`);
    }
    assert(Array.isArray(o.series), 'series must be an array');

    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    const series = Array.from(o.series, (line) => {
      assert(line && Array.isArray(line.data), 'each series needs a data array');
      for (const key of ['color', 'name']) {
        assert(line[key] === undefined || typeof line[key] === 'string',
          `series ${key} must be a string`);
      }
      const points = Array.from(line.data, (point, index) => {
        if (point === null) return null;
        const [x, y] = Array.isArray(point) ? point : [index, point];
        assert((!Array.isArray(point) || point.length === 2) && number(x)
          && (y === null || number(y)), 'points must be finite numbers, [x, y], or null');
        xMin = Math.min(xMin, x); xMax = Math.max(xMax, x);
        if (y === null) return null;
        yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
        return [x, y];
      });
      return { ...line, points };
    });

    const domain = (explicit, min, max) => {
      if (explicit !== undefined) {
        assert(Array.isArray(explicit) && explicit.length === 2
          && explicit.every(number) && explicit[0] < explicit[1],
        'domains must be [min, max] with finite min < max');
        [min, max] = explicit;
      } else if (!number(min)) {
        min = 0; max = 1;
      } else if (min === max) {
        const delta = min === 0 ? 1 : Math.abs(min) * 0.05;
        min -= delta; max += delta;
      }
      assert(number(max - min) && max > min, 'domain range must be finite and nonzero');
      return [min, max];
    };
    const [x0, x1] = domain(o.xDomain, xMin, xMax);
    const [y0, y1] = domain(o.yDomain, yMin, yMax);
    const w = width - padding * 2, h = height - padding * 2;
    const scale = ([x, y]) => [padding + ((x - x0) / (x1 - x0)) * w,
      height - padding - ((y - y0) / (y1 - y0)) * h];
    let seed = o.seed >>> 0;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0)
      / 4294967296 - 0.5);
    const round = (value) => +value.toFixed(2);

    // Jitter only between samples. Every real data point stays exactly on its coordinate.
    const path = (points) => {
      let d = '', previous;
      for (const point of points) {
        if (!point) { previous = undefined; continue; }
        const [x, y] = point;
        if (!previous) d += `M${round(x)},${round(y)}l0,0`;
        else {
          const [px, py] = previous, dx = x - px, dy = y - py;
          const length = Math.hypot(dx, dy);
          assert(number(length), 'segment range must be finite');
          const steps = roughness ? Math.min(256, Math.max(1, Math.ceil(length / 8))) : 1;
          for (let i = 1; i <= steps; i++) {
            const t = i / steps, offset = i === steps ? 0 : random() * roughness;
            d += i === steps ? `L${round(x)},${round(y)}`
              : `L${round(px + dx * t - dy / (length || 1) * offset)},${round(py + dy * t + dx / (length || 1) * offset)}`;
          }
        }
        previous = point;
      }
      return d;
    };

    // Share the counter across module copies, including charts in detached hosts.
    const root = target.getRootNode();
    let patternId;
    do {
      patternId = `tinychart-${doc[ID] = (doc[ID] || 0) + 1}`;
    } while ([doc, root].some((scope) => scope.id === patternId
      || scope.id === `${patternId}-clip`
      || scope.querySelector(`#${patternId},#${patternId}-clip`)));

    const svg = node('svg', {
      xmlns: NS, viewBox: `0 0 ${width} ${height}`, width, height,
      role: 'img', 'aria-label': o.label,
      style: 'display:block;width:100%;height:auto;overflow:hidden',
    });
    svg.append(node('title', {}, o.label));
    const defs = node('defs');
    const clip = node('clipPath', { id: `${patternId}-clip` });
    clip.append(node('rect', { x: padding, y: padding, width: w, height: h }));
    defs.append(clip);
    svg.append(defs);
    if (o.dots) {
      const pattern = node('pattern', {
        id: patternId, width: dotSpacing, height: dotSpacing, patternUnits: 'userSpaceOnUse',
      });
      pattern.append(node('circle', { cx: dotSpacing / 2, cy: dotSpacing / 2, r: 0.8, fill: o.dotColor }));
      defs.append(pattern);
      svg.append(node('rect', { width, height, fill: `url(#${patternId})` }));
    }
    const ink = (points, color, parent, name) => {
      const group = node('g', { fill: 'none', stroke: color, 'stroke-width': strokeWidth,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      if (name) group.append(node('title', {}, name));
      group.append(node('path', { d: path(points) }));
      if (roughness) group.append(node('path', { d: path(points), opacity: 0.22,
        'stroke-width': strokeWidth * 0.65 }));
      parent.append(group);
    };
    if (o.axes) ink([[padding, padding], [padding, height - padding],
      [width - padding, height - padding]], o.color, svg);
    const plot = node('g', { 'clip-path': `url(#${patternId}-clip)` });
    svg.append(plot);
    for (const { points, color = o.color, name } of series) {
      const scaled = points.map((point) => point && scale(point));
      assert(scaled.every((point) => !point || point.every(number)), 'scaled points must be finite');
      ink(scaled, color, plot, name);
    }
    return svg;
  };

  let svg = render(config);
  target.appendChild(svg);
  return {
    get svg() { return svg; },
    update(patch = {}) {
      assert(alive, 'cannot update a destroyed chart');
      const next = { ...config, ...patch };
      const replacement = render(next);
      svg.replaceWith(replacement);
      svg = replacement;
      config = next;
    },
    destroy() { svg.remove(); alive = false; },
  };
}
