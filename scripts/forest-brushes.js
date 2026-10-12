export const LEAVES = 'digjmnq';
export const WOOD = 'uvwoxy';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = t => t * t * (3 - 2 * t);
export function hash(x, y, seed = 0) {
  let n = Math.imul(x + 131, 374761393) ^ Math.imul(y + 137, 668265263) ^ Math.imul(seed + 17, 1274126177);
  n = Math.imul(n ^ n >>> 13, 1274126177);
  return ((n ^ n >>> 16) >>> 0) / 4294967295;
}
export function noise(x, y, size, seed = 0) {
  const ix = Math.floor(x / size), iy = Math.floor(y / size);
  const fx = smooth(x / size - ix), fy = smooth(y / size - iy);
  const a = hash(ix, iy, seed) * (1 - fx) + hash(ix + 1, iy, seed) * fx;
  const b = hash(ix, iy + 1, seed) * (1 - fx) + hash(ix + 1, iy + 1, seed) * fx;
  return a * (1 - fy) + b * fy;
}
export function curve(points, t) {
  const weights = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3];
  return points.reduce((p, point, i) => [p[0] + point[0] * weights[i], p[1] + point[1] * weights[i]], [0, 0]);
}
export function raster(width, height) {
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));
  const pixel = (x, y, token, mask) => {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < width && y < height - 1 && (!mask || mask.includes(grid[y][x]))) grid[y][x] = token;
  };
  const line = (ax, ay, bx, by, token, mask) => {
    const n = Math.max(Math.abs(ax - bx), Math.abs(ay - by), 1);
    for (let i = 0; i <= n; i++) pixel(ax + (bx - ax) * i / n, ay + (by - ay) * i / n, token, mask);
  };
  const rect = (x, y, w, h, token, mask) => {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) pixel(x + dx, y + dy, token, mask);
  };
  return { width, height, grid, pixel, line, rect,
    finish: (id, label, anchor) => ({ id, label, size: [width, height], anchor, pixels: grid.map(row => row.join('')) }) };
}

// Paint the union once: a fork shares one surface instead of overlapping shaded ribbons.
export function woodSurface(d, strokes, seed, ramp = WOOD) {
  const field = new Float32Array(d.width * d.height).fill(-100);
  const geometry = new Array(field.length);
  for (const stroke of [...strokes].sort((a,b)=>a.id.localeCompare(b.id))) {
    const points = stroke.points, steps = 300;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, [cx, cy] = curve(points, t);
      const [ax, ay] = curve(points, Math.max(0, t - .003)), [bx, by] = curve(points, Math.min(1, t + .003));
      const length = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / length, ny = (bx - ax) / length;
      const radius = stroke.radii[0] * (1 - t) + stroke.radii[1] * t;
      for (let y = Math.max(0, Math.floor(cy - radius - 2)); y <= Math.min(d.height - 2, cy + radius + 2); y++) {
        for (let x = Math.max(0, Math.floor(cx - radius - 2)); x <= Math.min(d.width - 1, cx + radius + 2); x++) {
          const index = y * d.width + x, distance = radius - Math.hypot(x - cx, y - cy);
          if (distance <= field[index]) continue;
          field[index] = distance;
          geometry[index] = { radius, nx, ny, offset: (x - cx) * nx + (y - cy) * ny, t };
        }
      }
    }
  }
  for (let y = 0; y < d.height - 1; y++) for (let x = 0; x < d.width; x++) {
    const index = y * d.width + x, depth = field[index];
    if (depth < 0) continue;
    const g = geometry[index], u = clamp(g.offset / g.radius, -.99, .99);
    const gx = (field[index + 1] ?? depth) - (field[index - 1] ?? depth);
    const gy = (field[index + d.width] ?? depth) - (field[index - d.width] ?? depth);
    const normal = Math.hypot(gx, gy) || 1;
    const light = (gx * .75 + gy * .65) / normal;
    let shade = 1.1 + Math.sqrt(1 - u * u) * 2 + light * .7;
    const grain = Math.sin(g.offset * 1.35 + noise(x, y, 18, seed) * 3 + g.t * 5);
    if (grain > .7 && depth > 1.6 && noise(x, y, 7, seed + 4) < .72) shade -= .75;
    if (depth < .9) shade = light > .4 ? 2 : .3;
    if (noise(x, y, 5, seed + 9) > .7 && shade > 2.4) shade += .7;
    d.pixel(x, y, ramp[clamp(Math.round(shade), 0, ramp.length - 1)]);
  }
}

export function leafMass(d, cx, cy, rx, ry, seed, light = 0) {
  const filled = new Set();
  for (let y = Math.floor(cy - ry - 3); y <= cy + ry + 3; y++) for (let x = Math.floor(cx - rx - 3); x <= cx + rx + 3; x++) {
    if (x < 0 || y < 0 || x >= d.width || y >= d.height - 1) continue;
    const nx = (x - cx) / rx, ny = (y - cy) / ry, angle = Math.atan2(ny, nx);
    const edge = 1 + Math.sin(angle * 5 + seed) * .05 + Math.sin(angle * 9 - seed) * .035;
    if (nx * nx + ny * ny > edge * edge + (noise(x, y, 6, seed) - .5) * .12) continue;
    filled.add(y * d.width + x);
    const n = noise(x, y, 14, seed) * 1.2 + noise(x, y, 4, seed + 3) * 1.05;
    const shade = 1.45 + light - ny * .8 - nx * .35 + n;
    d.pixel(x, y, LEAVES[clamp(Math.floor(shade), 0, 5)]);
  }
  // Jittered, differently sized clusters follow each mass, not a repeating leaf stamp.
  for (let row = 0; row < Math.ceil(ry * 2 / 6); row++) for (let column = 0; column < Math.ceil(rx * 2 / 7); column++) {
    const h = hash(column, row, seed), v = hash(row, column, seed + 2);
    if (h < .18) continue;
    const x = Math.round(cx - rx + column * 7 + h * 5), y = Math.round(cy - ry + row * 6 + v * 4);
    const width = 2 + Math.floor(h * 4), height = 2 + Math.floor(v * 2);
    for (let dy = 0; dy < height; dy++) for (let dx = 0; dx < width; dx++) {
      if (!filled.has((y + dy) * d.width + x + dx) || Math.abs(dx - width / 2) > width / 2 - (dy === 0 ? 1 : 0)) continue;
      const base = LEAVES.indexOf(d.grid[y + dy][x + dx]);
      d.pixel(x + dx, y + dy, LEAVES[clamp(base + (dy === 0 && dx < width - 1 ? 1 : dy === height - 1 ? -1 : 0), 1, 6)]);
    }
  }
}

export function barkScars(d, trunk) {
  for (const [t, offset, length] of [[.14,-.25,.09],[.28,.28,.1],[.43,-.31,.07],[.58,.21,.06]]) {
    let previous;
    for(let i=0;i<=18;i++) {
      const at=t+length*i/18, [x,y]=curve(trunk.points,at);
      const [ax,ay]=curve(trunk.points,at-.003),[bx,by]=curve(trunk.points,at+.003);
      const norm=Math.hypot(bx-ax,by-ay)||1,radius=trunk.radii[0]*(1-at)+trunk.radii[1]*at;
      const u=radius*(offset+Math.sin(i/18*Math.PI)*.13);
      const point=[x-(by-ay)/norm*u,y+(bx-ax)/norm*u];
      if(previous)d.line(...previous,...point,'v',WOOD);
      previous=point;
      if(i>2&&i<12)d.pixel(point[0]-1,point[1],'o',WOOD);
    }
  }
  const [cx,cy]=curve(trunk.points,.24);
  for(let y=-4;y<=4;y++)for(let x=-3;x<=3;x++)if((x/3)**2+(y/4)**2<=1)d.pixel(cx+x,cy+y,
    x===0&&Math.abs(y)<3?'u':x<0&&Math.abs(y)>1?'o':'v',WOOD);
}

export function vine(d, x, y, length, bend, seed) {
  let start = y;
  while (start > Math.max(0, y - 18) && d.grid[start]?.[x] === '.') start--;
  if (!d.grid[start] || d.grid[start][x] === '.') throw new Error('Unattached vine: ' + x + ',' + y);
  let previous = [x, start];
  for (let n = 1; n < length; n++) {
    const t = n / length, sx = x + Math.round(bend * t * t + Math.sin(t * Math.PI) * .8), sy = start + n;
    d.line(...previous, sx, sy, 'i'); previous = [sx, sy];
    if (n < length * .25) d.pixel(sx - 1, sy, 'g');
    if (n > 3 && n < length - 4 && hash(n, x, seed) > .87) {
      const side = n % 2 ? 1 : -1;
      d.line(sx, sy, sx + side * 2, sy + 1, 'g');
      d.pixel(sx + side * 2, sy, 'j');
      d.pixel(sx + side * 2, sy + 2, 'g');
    }
  }
}

export function wind(sprite) {
  const locations = [];
  for (let y = 9; y < sprite.size[1] - 38 && locations.length < 5; y += 17) {
    for (let x = 9 + y % 9; x < sprite.size[0] - 9 && locations.length < 5; x += 23) {
      if (sprite.pixels.slice(y, y + 5).every(row => [...row.slice(x, x + 6)].every(token => LEAVES.includes(token)))) locations.push([x, y, 6, 5]);
    }
  }
  if (!locations.length) throw new Error(sprite.id + ': missing wind regions');
  const variants = { rest: [] };
  for (const [id, phase] of [['right', 1], ['drift', 2], ['left', 3]]) {
    variants[id] = locations.map(([x, y, width, height], group) => ({ at: [x, y],
      pixels: sprite.pixels.slice(y, y + height).map((row, dy) => [...row.slice(x, x + width)].map((token, dx) => {
        const changed = (dx + phase + group) % 4 === 0 && dy < 3;
        return changed ? LEAVES[clamp(LEAVES.indexOf(token) + (dy === 0 ? 1 : -1), 1, 5)] : token;
      }).join('')) }));
  }
  return { ...sprite, variants, animation: { loop: true, blend: 'palette', regions: locations,
    frames: [['rest',800],['right',300],['drift',400],['left',300],['rest',500],['left',300],['drift',400],['right',300]]
      .map(([id, duration]) => ({ id, duration })) } };
}
