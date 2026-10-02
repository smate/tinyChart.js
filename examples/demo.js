import { tinyChart } from '../src/index.js';

const $ = (id) => document.getElementById(id);
const ideas = [18, 64, 32, 45, 24, 77, 54];
const coffees = [9, 28, 20, 40, 31, 49, 38];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const chart = tinyChart('#chart');
let seed = 7;

function draw() {
  const roughness = Number($('roughness').value);
  const multiple = $('multiple').checked;
  const series = [{ name: 'Ideas', data: ideas, color: $('color-a').value }];
  if (multiple) series.push({ name: 'Coffees', data: coffees, color: $('color-b').value });
  chart.update({
    series, seed, roughness, dots: $('dots').checked, axes: $('axes').checked,
    width: 640, height: 300, yDomain: [0, 90], dotSpacing: 18,
    dotColor: '#dcded0', color: '#585d50', strokeWidth: 2.7,
    label: `Daily ideas${multiple ? ' and coffees' : ''} from Monday to Sunday. Data table below.`,
  });
  $('roughness-value').value = roughness.toFixed(1);
  $('second-legend').hidden = !multiple;
  document.documentElement.style.setProperty('--accent', $('color-a').value);
  document.documentElement.style.setProperty('--green', $('color-b').value);
  $('data-rows').replaceChildren(...days.map((day, index) => {
    const row = document.createElement('tr');
    for (const value of [day, ideas[index], multiple ? coffees[index] : '—']) {
      const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
    }
    return row;
  }));
  $('code').textContent = `import { tinyChart } from 'tinychart.js';\n\ntinyChart('#chart', {\n  dots: ${$('dots').checked}, axes: ${$('axes').checked},\n  roughness: ${roughness}, seed: ${seed},\n  width: 640, height: 300, yDomain: [0, 90],\n  dotSpacing: 18, dotColor: '#dcded0',\n  color: '#585d50', strokeWidth: 2.7,\n  label: 'Daily ideas${multiple ? ' and coffees' : ''}',\n  series: [\n${series.map(({ data, color }) => `    { data: [${data.join(', ')}], color: '${color}' }`).join(',\n')}\n  ]\n});`;
}

for (const id of ['roughness', 'dots', 'axes', 'multiple', 'color-a', 'color-b']) {
  $(id).addEventListener('input', draw);
}
$('redraw').addEventListener('click', () => { seed++; draw(); });
draw();
