import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { readAssetSource } from '../scripts/asset-source.js';
import { animationsForCharacter, clipTime, compileCatalog, composePose, containsPoint, expandPart, frameAt, frameBounds, pixelBounds, resolvePose, rigForCharacter, rotatePixels, validateCatalog } from '../src/rendering/AssetModel.js';
import { createBitmap, encodePng, paintPixels, rgba } from '../scripts/png.js';
import { STATES } from '../src/creature/Creature.js';
import { WORLD_OBJECTS, World } from '../src/world/World.js';

function decodePng(buffer) {
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const compressed = [];
  let width;
  let height;
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8);
      assert.equal(data[9], 6);
    }
    if (type === 'IDAT') compressed.push(data);
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(compressed));
  assert.equal(raw.length, (width * 4 + 1) * height);
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    assert.equal(raw[row], 0);
    raw.copy(pixels, y * width * 4, row + 1, row + 1 + width * 4);
  }
  return { width, height, pixels };
}

test('the starter catalog covers every autonomous state with shared clips', () => {
  const source = readAssetSource();
  assert.equal(validateCatalog(source), true);
  assert.deepEqual(Object.keys(source.animations.states).sort(), [...STATES].sort());
  const compiled = compileCatalog(source);
  for (const character of Object.values(compiled.characters)) {
    for (const state of STATES) assert.ok(character.clips[compiled.states[state]]);
  }
});

test('colorways reuse every pose, anchor, duration and loop flag', () => {
  const source = readAssetSource();
  source.characters.characters['miga-moss'] = { ...structuredClone(source.characters.characters.miga), remap: { b: 'h', s: 'b' } };
  const compiled = compileCatalog(source);
  const normal = compiled.characters.miga;
  const moss = compiled.characters['miga-moss'];
  for (const [id, clip] of Object.entries(normal.clips)) {
    assert.equal(clip.loop, moss.clips[id].loop);
    assert.deepEqual(clip.frames.map(frame => frame.duration), moss.clips[id].frames.map(frame => frame.duration));
    clip.frames.forEach((frame, index) => {
      const first = compiled.frames[frame.id];
      const second = compiled.frames[moss.clips[id].frames[index].id];
      assert.deepEqual(first.anchor, second.anchor);
      assert.deepEqual(first.pixels.map(row => [...row].map(pixel => source.characters.characters['miga-moss'].remap[pixel] ?? pixel).join('')), second.pixels);
    });
  }
});

test('a compatible replacement head inherits animations without a new timeline', () => {
  const source = readAssetSource();
  source.parts['skull-alt'] = structuredClone(source.parts.skull);
  source.parts['skull-alt'].pixels = source.parts['skull-alt'].pixels.map(row => row.replaceAll('h', 'b'));
  source.characters.characters.newcomer = { label: 'Newcomer', parts: { ...source.characters.characters.miga.parts, head: 'skull-alt' }, remap: {} };
  const compiled = compileCatalog(source);
  assert.deepEqual(Object.keys(compiled.characters.newcomer.clips), Object.keys(compiled.characters.miga.clips));
  assert.notDeepEqual(compiled.frames['newcomer:stand'].pixels, compiled.frames['miga:stand'].pixels);
});

test('variant patches replace pixels including intentional transparent cuts', () => {
  const part = { pixels: ['bbbb', 'bbbb'], variants: { cut: [{ at: [1, 0], pixels: ['.k', 'kk'] }] } };
  assert.deepEqual(expandPart(part, 'cut'), ['b.kb', 'bkkb']);
});

test('validation rejects off-palette pixels and recolors', () => {
  const source = readAssetSource();
  source.parts.skull.pixels[0] = 'q' + source.parts.skull.pixels[0].slice(1);
  assert.throws(() => validateCatalog(source), /outside the palette/);
  const recolor = readAssetSource();
  recolor.characters.characters.miga.remap = { b: 'q' };
  assert.throws(() => validateCatalog(recolor), /invalid recolor/);
});

test('validation rejects palette expansion beyond sixteen colors', () => {
  const source = readAssetSource();
  source.style.colors.z = { hex: '#ffffff' };
  assert.throws(() => validateCatalog(source), /1 to 16 colors/);
});

test('validation rejects fractional origins, oversized art and ragged rows', () => {
  const fractional = readAssetSource();
  fractional.characters.rig.slots[0].at[0] = 0.5;
  assert.throws(() => validateCatalog(fractional), /fractional rig origin/);
  const oversized = readAssetSource();
  oversized.parts.skull.size[0] = 65;
  assert.throws(() => validateCatalog(oversized), /invalid dimensions/);
  const ragged = readAssetSource();
  ragged.parts.skull.pixels[0] += '.';
  assert.throws(() => validateCatalog(ragged), /must have 20 pixels/);
});

test('validation rejects incompatible parts, pose cycles and clipping', () => {
  const incompatible = readAssetSource();
  delete incompatible.parts.skull.variants.blink;
  assert.throws(() => validateCatalog(incompatible), /missing head variant/);
  const cycle = readAssetSource();
  cycle.animations.poses.stand.extends = 'blink';
  assert.throws(() => validateCatalog(cycle), /inheritance cycle/);
  const clipped = readAssetSource();
  clipped.animations.poses.stand.offset = [100, 0];
  assert.throws(() => validateCatalog(clipped), /clips outside/);
});

test('validation rejects invalid timing, unknown poses and incorrect object anchors', () => {
  const timing = readAssetSource();
  timing.animations.clips.walk.frames[0][1] = 0;
  assert.throws(() => validateCatalog(timing), /invalid frame or duration/);
  const pose = readAssetSource();
  pose.animations.clips.walk.frames[0][0] = 'missing';
  assert.throws(() => validateCatalog(pose), /invalid frame or duration/);
  const anchor = readAssetSource();
  anchor.characters.objects.lantern.anchor = [-1, 0];
  assert.throws(() => validateCatalog(anchor), /invalid object anchor/);
});

test('playback loops on exact boundaries and holds the last non-looping frame', () => {
  const frames = [{ id: 'first', duration: 100 }, { id: 'second', duration: 200 }];
  const loop = { loop: true, frames };
  assert.equal(frameAt(loop, 0).id, 'first');
  assert.equal(frameAt(loop, 0.1).id, 'second');
  assert.equal(frameAt(loop, 0.3).id, 'first');
  assert.equal(frameAt({ loop: false, frames }, 100).id, 'second');
  assert.equal(frameAt(loop, -3).id, 'first');
  assert.equal(frameAt(loop, NaN).id, 'first');
});

test('PNG encoding is deterministic, nearest-neighbor and preserves transparency', () => {
  const bitmap = createBitmap(4, 4);
  paintPixels(bitmap, ['k.', '.b'], { k: '#233b37', b: '#eee4c9' }, 0, 0, 2);
  const png = encodePng(bitmap);
  assert.deepEqual(png, encodePng(bitmap));
  const decoded = decodePng(png);
  assert.deepEqual([...decoded.pixels.subarray(0, 4)], rgba('#233b37'));
  assert.deepEqual([...decoded.pixels.subarray(4, 8)], rgba('#233b37'));
  assert.deepEqual([...decoded.pixels.subarray(8, 12)], [0, 0, 0, 0]);
  assert.deepEqual([...decoded.pixels.subarray(60, 64)], rgba('#eee4c9'));
});

test('every exported atlas pixel and clip agrees with the editable sources', () => {
  const catalog = compileCatalog(readAssetSource());
  const manifest = JSON.parse(readFileSync(new URL('../assets/generated/atlas.json', import.meta.url), 'utf8'));
  const atlas = decodePng(readFileSync(new URL('../assets/generated/atlas.png', import.meta.url)));
  assert.equal(atlas.width, manifest.width);
  assert.equal(atlas.height, manifest.height);
  for (const key of ['palette', 'states', 'characters', 'objects']) assert.deepEqual(manifest[key], catalog[key]);
  assert.deepEqual(Object.keys(manifest.frames), Object.keys(catalog.frames));
  for (const [id, frame] of Object.entries(catalog.frames)) {
    const exported = manifest.frames[id];
    assert.deepEqual(exported.anchor, frame.anchor);
    assert.deepEqual(exported.bounds, pixelBounds(frame.pixels));
    assert.equal(exported.width, frame.pixels[0].length);
    assert.equal(exported.height, frame.pixels.length);
    assert.ok(exported.x >= 0 && exported.y >= 0 && exported.x + exported.width <= atlas.width && exported.y + exported.height <= atlas.height);
    let visible = 0;
    frame.pixels.forEach((row, y) => [...row].forEach((pixel, x) => {
      const offset = ((exported.y + y) * atlas.width + exported.x + x) * 4;
      const expected = pixel === '.' ? [0, 0, 0, 0] : rgba(catalog.palette[pixel]);
      assert.deepEqual([...atlas.pixels.subarray(offset, offset + 4)], expected, `${id} at ${x},${y}`);
      if (pixel !== '.') visible++;
    }));
    assert.ok(visible > 0, `${id} must not be blank`);
  }
});

test('fantasy props retain saved discovery identities', () => {
  assert.equal(WORLD_OBJECTS.find(object => object.id === 'can').kind, 'lantern');
  assert.equal(WORLD_OBJECTS.find(object => object.id === 'stone').kind, 'rune');
  const world = new World({ discoveredObjects: ['can', 'stone'] });
  world.discover('can');
  assert.deepEqual(world.serialize().discoveredObjects, ['can', 'stone']);
  assert.equal(world.events.length, 0);
});

test('composition stays stable across repeated calls and does not mutate source art', () => {
  const source = readAssetSource();
  const before = JSON.stringify(source);
  const first = composePose(source, 'miga', 'walk-a');
  assert.deepEqual(first, composePose(source, 'miga', 'walk-a'));
  assert.equal(JSON.stringify(source), before);
});


test('only the approved skeleton and current prop sources remain active', () => {
  const source = readAssetSource();
  assert.deepEqual(Object.keys(source.characters.characters), ['miga']);
  assert.deepEqual(Object.keys(source.parts).sort(), ['arm', 'leg', 'skull', 'ribs', 'pelvis', 'lantern', 'rune'].sort());
  const rig = rigForCharacter(source, 'miga');
  assert.deepEqual(rig.size, [64, 64]);
  assert.deepEqual(rig.anchor, [32, 61]);
  assert.equal(rig.slots.length, 7);
  assert.equal(rig.slots.some(slot => slot.name === 'cape'), false);
});

test('every walking frame turns the skull, ribs and pelvis into profile', () => {
  const source = readAssetSource();
  const set = animationsForCharacter(source, 'miga');
  assert.equal(set.clips.walk.frames.length, 8);
  for (const [id] of set.clips.walk.frames) {
    const pose = resolvePose(set.poses, id);
    for (const slot of ['head', 'body', 'pelvis']) assert.equal(pose.variants[slot], 'profile');
    assert.equal(pose.mirrors.leftArm, true);
    assert.equal(pose.mirrors.leftLeg, false);
    const bounds = pixelBounds(composePose(source, 'miga', id));
    assert.equal(bounds.y + bounds.height, 61, id + ' must retain a planted support foot');
  }
  assert.notDeepEqual(composePose(source, 'miga', 'walk-a'), composePose(source, 'miga', 'walk-b'));
});

test('sleep rests as folded detached limbs with the skull upright on the floor', () => {
  const source = readAssetSource();
  const catalog = compileCatalog(source);
  const sleep = catalog.frames['miga:sleep'];
  assert.ok(sleep.bounds.width > sleep.bounds.height * 2);
  assert.equal(sleep.bounds.y + sleep.bounds.height, 61);
  assert.ok(sleep.bounds.height <= 24);
  const pose = resolvePose(source.animations.poses, 'sleep');
  assert.equal(pose.rotation, 0);
  assert.equal(pose.rotations.body, 90);
  for (const slot of ['leftArm', 'rightArm', 'leftLeg', 'rightLeg']) assert.equal(pose.variants[slot], 'sleep-folded');
  expandPart(source.parts.skull, 'blink').slice(0, 18).forEach((row, y) => assert.equal(sleep.pixels[y + 43].slice(38, 58), row));
  assert.ok(sleep.pixels.slice(44, 61).every(row => row[38] === '.'), 'a clear gap separates the visible foot from the head');
});

test('the compact reference skull has a seven-pixel crown, 2x4 eye and uneven teeth', () => {
  const part = readAssetSource().parts.skull;
  const rows = expandPart(part, 'profile');
  assert.deepEqual(pixelBounds(rows), { x: 2, y: 2, width: 15, height: 15 });
  assert.equal(rows[2].slice(6, 13), 'kkkkkkk');
  for (const row of rows.slice(8, 12)) {
    assert.equal(row.slice(12, 14), 'kk');
    assert.equal(row.slice(14, 16), 'hh');
  }
  assert.equal(rows[15].slice(9, 16), 'hhkhkhk');
  assert.ok(rows.slice(6, 13).every(row => row[2] === 'k' && row[16] === 'k'));
  assert.deepEqual(expandPart(part, 'profile-blink').slice(14), rows.slice(14));
});

test('redesigned legs keep the approved hip, knee, ankle and sole trajectories', () => {
  const source = readAssetSource();
  const joints = [
    ['contact-a', [8, 10], [10, 18], [9, 19, 7]], ['contact-b', [2, 10], [1, 18], [0, 19, 8]],
    ['support-front', [6, 11], [8, 18], [7, 19, 8]], ['support-mid', [4, 10], [4, 18], [3, 19, 8]],
    ['support-back', [3, 10], [2, 18], [1, 19, 8]], ['lift-back', [2, 10], [2, 15], [1, 16, 8]],
    ['pass', [8, 9], [5, 14], [4, 15, 8]], ['reach', [9, 8], [11, 16], [9, 17, 7]],
  ];
  for (const [id, knee, ankle, [x, y, width]] of joints) {
    const rows = expandPart(source.parts.leg, id);
    for (const [px, py] of [[4, 1], knee, ankle]) assert.match(rows[py][px], /[hbs]/, id + ' joint center');
    assert.equal(rows[y + 2].slice(x, x + width), 'k'.repeat(width), id + ' retains the sole position');
    assert.equal(rows[y + 1].slice(x + 1, x + width - 1), 'h' + 'b'.repeat(width - 3), id + ' has a filled foot');
  }
  const expected = [
    ['walk-a', 'contact-b', 'contact-a'], ['walk-down-a', 'lift-back', 'support-front'],
    ['walk-pass-a', 'pass', 'support-mid'], ['walk-up-a', 'reach', 'support-back'],
    ['walk-b', 'contact-a', 'contact-b'], ['walk-down-b', 'support-front', 'lift-back'],
    ['walk-pass-b', 'support-mid', 'pass'], ['walk-up-b', 'support-back', 'reach'],
  ];
  assert.deepEqual(source.animations.clips.walk.frames, expected.map(([id]) => [id, 120]));
  for (const [id, left, right] of expected) {
    const pose = resolvePose(source.animations.poses, id);
    assert.equal(pose.variants.leftLeg, left);
    assert.equal(pose.variants.rightLeg, right);
    assert.deepEqual(pose.offsets.leftLeg, [11, 0]);
    assert.deepEqual(pose.offsets.rightLeg, [-2, 0]);
    assert.equal(pose.mirrors.leftLeg, false);
  }
});

test('all clips outside sleep and its shared wake poses retain approved pixels and metadata', () => {
  const catalog = compileCatalog(readAssetSource());
  const reference = Object.entries(catalog.characters.miga.clips).filter(([id]) => !['sleep', 'wake'].includes(id))
    .map(([id, clip]) => [id, clip, clip.frames.map(frame => catalog.frames[frame.id].pixels)]);
  assert.equal(createHash('sha256').update(JSON.stringify(reference)).digest('hex'),
    '761a8b16ff34b6bb11f5de1f97b9ae5a71a7c27f372d26024b41884c28de3ce7');
});

test('sleep layout changes preserve every timeline, anticipation pixels and the shared wake starting pose', () => {
  const catalog = compileCatalog(readAssetSource());
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(hash(catalog.characters.miga.clips), '0286c8570721a3443804f076d997e4760817da76097b69026122242f6a7f8875');
  assert.equal(hash(catalog.characters.miga.clips.sleep.frames.slice(0, 5).map(f => catalog.frames[f.id].pixels)),
    '0430f592718bce27dede369be8d2e36490e8b09ce22482f31f9eff7e8f7ab46e');
  assert.equal(catalog.characters.miga.clips.wake.frames[0].id, catalog.characters.miga.clips.sleep.frames.at(-1).id);
});

test('sleeping ribs contact the floor and a grounded foot stays visible to their right in both directions', () => {
  const source = readAssetSource();
  const ribs = pixelBounds(rotatePixels(expandPart(source.parts.ribs, 'rest'), 90));
  const bottom = id => 22 + resolvePose(source.animations.poses, id).offsets.body[1] + ribs.y + ribs.height;
  assert.deepEqual(['doze-impact', 'doze-rebound', 'doze-rebound-low', 'doze-settle', 'doze-last-tap', 'sleep']
    .map(bottom), [61, 60, 61, 61, 61, 61]);
  const pose = resolvePose(source.animations.poses, 'sleep');
  const full = composePose(source, 'miga', 'sleep');
  const mirrored = full.map(row => [...row].reverse().join(''));
  assert.equal(pose.mirrors.rightLeg, true);
  const foot = expandPart(source.parts.leg, pose.variants.rightLeg).map(row => [...row].reverse().join(''));
  const legX = 31 + pose.offsets.rightLeg[0], legY = 39 + pose.offsets.rightLeg[1];
  const ribsRight = 25 + pose.offsets.body[0] + ribs.x + ribs.width - 1;
  const headLeft = 22 + pose.offsets.head[0] + pixelBounds(expandPart(source.parts.skull, 'blink')).x;
  const columns = new Set();
  let material = 0;
  for (let y = 21; y <= 23; y++) [...foot[y]].forEach((pixel, x) => {
    const wx = legX + x, wy = legY + y;
    if (pixel === '.' || wx <= ribsRight || wx >= headLeft) return;
    assert.equal(full[wy][wx], pixel, 'the projecting foot cannot be hidden by the ribs');
    assert.equal(mirrored[wy][63 - wx], pixel, 'the foot also remains visible when facing left');
    columns.add(wx);
    if (pixel !== 'k') material++;
  });
  assert.ok(columns.size >= 4 && material >= 4, 'a recognizable filled foot, not just an outline sliver');
  assert.ok(full[60].slice(ribsRight + 1, headLeft).includes('k'), 'the visible sole is on the floor');
});

test('folded sleeping limbs have one connected silhouette with recognizable elbows and knees', () => {
  const source = readAssetSource();
  for (const [part, joint] of [['arm', [12, 19]], ['leg', [12, 17]]]) {
    for (const [variant, shift] of [['sleep-folded', 0], ['sleep-folded-air', -3]]) {
      const rows = expandPart(source.parts[part], variant);
      assert.equal(rows[joint[1] + shift].slice(joint[0], joint[0] + 2), 'ss');
      const visible = new Set();
      rows.forEach((row, y) => [...row].forEach((pixel, x) => { if (pixel !== '.') visible.add(x + ',' + y); }));
      const queue = [[...visible][0]];
      const connected = new Set(queue);
      for (let i = 0; i < queue.length; i++) {
        const [x, y] = queue[i].split(',').map(Number);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const key = (x + dx) + ',' + (y + dy);
          if (visible.has(key) && !connected.has(key)) { connected.add(key); queue.push(key); }
        }
      }
      assert.equal(connected.size, visible.size, part + ' folds at a joint instead of splitting into little piles');
    }
  }
});

test('fallen ribs and pelvis stay in front of every limb, remain separated and mirror correctly', () => {
  const source = readAssetSource();
  const slots = rigForCharacter(source, 'miga').slots;
  const getPiece = (pose, slotName) => {
    const slot = slots.find(s => s.name === slotName);
    let rows = expandPart(source.parts[source.characters.characters.miga.parts[slotName]], pose.variants[slotName]);
    if (pose.mirrors[slotName] ?? slot.mirror) rows = rows.map(row => [...row].reverse().join(''));
    rows = rotatePixels(rows, pose.rotations[slotName]);
    return { rows, x: slot.at[0] + pose.offsets[slotName][0], y: slot.at[1] + pose.offsets[slotName][1] };
  };
  for (const id of ['doze-fall-high', 'doze-fall-low', 'doze-impact', 'doze-rebound', 'doze-rebound-low', 'doze-settle', 'doze-last-tap', 'sleep', 'sleep-bounce', 'sleep-drop']) {
    const pose = resolvePose(source.animations.poses, id);
    const full = composePose(source, 'miga', id);
    const mirrored = full.map(row => [...row].reverse().join(''));
    const head = getPiece(pose, 'head');
    const body = getPiece(pose, 'body');
    const pelvis = getPiece(pose, 'pelvis');
    const bb = pixelBounds(body.rows), pb = pixelBounds(pelvis.rows);
    assert.ok(pelvis.x + pb.x + pb.width <= body.x + bb.x, id + ': readable gap between pelvis and ribs');
    for (const slot of ['body', 'pelvis']) {
      for (const limb of ['leftArm', 'rightArm', 'leftLeg', 'rightLeg']) {
        assert.ok(pose.drawOrder.indexOf(slot) > pose.drawOrder.indexOf(limb));
      }
      const piece = getPiece(pose, slot);
      piece.rows.forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel === '.') return;
        const wx = piece.x + x, wy = piece.y + y;
        const headPixel = head.rows[wy - head.y]?.[wx - head.x];
        if (headPixel && headPixel !== '.') return;
        assert.equal(full[wy][wx], pixel, id + ': limb must not erase ' + slot);
        assert.equal(mirrored[wy][63 - wx], pixel, id + ': foreground survives mirroring');
      }));
    }
  }
});

test('sleep collapse plays only once, including after reload at a long elapsed time', () => {
  const clip = compileCatalog(readAssetSource()).characters.miga.clips.sleep;
  assert.equal(clip.loopFrom, 13);
  const phases = [[0, 'doze-heavy'], [0.2, 'doze-yawn'], [0.4, 'doze-close'], [0.5, 'doze-nod'],
    [0.65, 'doze-crouch'], [0.78, 'doze-release'], [0.88, 'doze-fall-high'], [0.96, 'doze-fall-low'],
    [1.04, 'doze-impact'], [1.12, 'doze-rebound'], [1.2, 'doze-rebound-low'], [1.3, 'doze-settle'], [1.38, 'doze-last-tap']];
  for (const [time, id] of phases) assert.equal(frameAt(clip, time).id, 'miga:' + id);
  for (const time of [1.42, 3, 10, 120, 86400]) assert.equal(frameAt(clip, time).id, 'miga:sleep');
  assert.ok(clipTime(clip, 120) >= 1.42);
});

test('sleep anticipation closes the eyes and yawns without changing the approved skull silhouette', () => {
  const skull = readAssetSource().parts.skull;
  const rest = expandPart(skull, 'rest');
  const heavy = expandPart(skull, 'sleep-heavy');
  assert.deepEqual(pixelBounds(heavy), pixelBounds(rest));
  heavy.forEach((row, y) => {
    if (y !== 8 && y !== 9) assert.equal(row, rest[y]);
  });
  for (const [variant, mouth] of [['sleep-yawn', 'mouth-open'], ['sleep-yawn-close', 'mouth-small']]) {
    const rows = expandPart(skull, variant);
    assert.deepEqual(rows.slice(0, 16), expandPart(skull, 'blink').slice(0, 16));
    assert.deepEqual(rows.slice(16), expandPart(skull, mouth).slice(16));
  }
});

test('sleep crouching bends the knees but preserves resting soles and planted feet', () => {
  const source = readAssetSource();
  for (const variant of ['sleep-crouch-mid', 'sleep-crouch-low']) {
    const rows = expandPart(source.parts.leg, variant);
    assert.deepEqual(rows.slice(18, 22), expandPart(source.parts.leg, 'rest').slice(18, 22));
    assert.ok(rows.some(row => row.includes('khbk')));
    assert.ok(rows.some(row => row.includes('kssk')));
  }
  for (const id of ['doze-heavy', 'doze-yawn', 'doze-close', 'doze-nod', 'doze-crouch', 'doze-release']) {
    const bounds = pixelBounds(composePose(source, 'miga', id));
    assert.equal(bounds.y + bounds.height, 61, id + ' has no sliding or hovering feet');
  }
});

test('sleep lands in stages, keeps the skull upright and damps its rebound above the floor', () => {
  const source = readAssetSource();
  const catalog = compileCatalog(source);
  const slots = rigForCharacter(source, 'miga').slots;
  const bottom = (id, slotName) => {
    const pose = resolvePose(source.animations.poses, id);
    const slot = slots.find(s => s.name === slotName);
    const part = source.parts[source.characters.characters.miga.parts[slotName]];
    const b = pixelBounds(expandPart(part, pose.variants[slotName]));
    return slot.at[1] + pose.offsets[slotName][1] + b.y + b.height;
  };
  assert.equal(bottom('doze-fall-low', 'leftLeg'), 61);
  assert.ok(bottom('doze-fall-low', 'head') < 61);
  assert.deepEqual(['doze-impact', 'doze-rebound', 'doze-rebound-low', 'doze-settle', 'doze-last-tap', 'sleep']
    .map(id => bottom(id, 'head')), [61, 57, 59, 61, 60, 61]);
  for (const frame of catalog.characters.miga.clips.sleep.frames) {
    const b = catalog.frames[frame.id].bounds;
    assert.ok(b.y + b.height <= 61, frame.id + ' never penetrates the floor');
    assert.ok(b.width > 0 && b.height > 0);
    const pose = resolvePose(source.animations.poses, frame.id.slice(5));
    assert.equal(pose.rotations.head ?? 0, 0);
    assert.equal(pose.rotation, 0);
  }
});

test('arm swings stay attached and counterbalance the legs while keeping the ribs readable', () => {
  const source = readAssetSource();
  const p = source.animations.poses;
  for (const id of ['walk-a', 'walk-b']) {
    const pose = resolvePose(p, id);
    assert.equal(pose.variants.rightArm, id === 'walk-a' ? 'swing-back' : 'swing-forward');
    assert.equal(pose.variants.rightLeg, id === 'walk-a' ? 'contact-a' : 'contact-b');
    assert.equal(pose.variants.leftArm, id === 'walk-a' ? 'far-swing-forward' : 'far-swing-back');
    assert.equal(pose.mirrors.leftArm, true);
    assert.deepEqual(pose.remaps.leftArm, { h: 'b', b: 's' });
  }
  const arm = source.parts.arm;
  const variants = ['swing-forward', 'swing-forward-mid', 'swing-neutral', 'swing-back-mid', 'swing-back'];
  for (const prefix of ['', 'far-']) {
    const shoulder = expandPart(arm, prefix + variants[0]).slice(0, 6);
    for (const id of variants) assert.deepEqual(expandPart(arm, prefix + id).slice(0, 6), shoulder);
  }
  const ribs = expandPart(source.parts.ribs, 'profile');
  for (const [id] of source.animations.clips.walk.frames) {
    const pose = resolvePose(p, id);
    const full = composePose(source, 'miga', id);
    let visible = 0, count = 0;
    ribs.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === '.' || y < 4 || y > 12) return;
      count++;
      if (full[22 + y + pose.offsets.body[1]][25 + x + pose.offsets.body[0]] === pixel) visible++;
    }));
    assert.ok(visible / count > 0.7, id + ' must show most of the rib cage despite the foreground arm');
    const bob = pose.offsets.body[1];
    assert.deepEqual(pose.offsets.head, [2, bob + 1]);
    assert.equal(full[22 + bob].slice(31, 34), 'khk', id + ' keeps the neck aligned with the profile spine');
    assert.deepEqual(pose.offsets.leftArm, [12, bob]);
    assert.deepEqual(pose.offsets.rightArm, [-13, bob]);
  }
});

test('the humerus swings from a fixed shoulder with a moving elbow in both depth planes', () => {
  const source = readAssetSource();
  const keys = [
    ['forward', [11, 13], [12, 19]], ['forward-mid', [9, 14], [10, 20]],
    ['neutral', [7, 14], [7, 20]], ['back-mid', [5, 14], [4, 20]], ['back', [3, 13], [2, 19]],
  ];
  for (const prefix of ['', 'far-']) {
    const upperArms = new Set();
    for (const [key, elbow, wrist] of keys) {
      const e = prefix ? [14 - elbow[0], elbow[1]] : elbow;
      const w = prefix ? [14 - wrist[0], wrist[1]] : wrist;
      const rows = expandPart(source.parts.arm, prefix + 'swing-' + key);
      assert.equal(rows[5].slice(6, 10), 'khbk', 'stationary shoulder');
      assert.equal(rows[e[1]].slice(e[0] - 1, e[0] + 3), 'kssk', 'moving elbow');
      assert.equal(rows[w[1]].slice(w[0] - 1, w[0] + 3), 'khbk', 'continuous wrist');
      upperArms.add(rows.slice(6, 12).join(''));
      const humerus = Math.hypot(e[0] - 7, e[1] - 5);
      assert.ok(humerus >= 8.9 && humerus <= 9.3, 'no telescoping upper arm');
      assert.ok(Math.hypot(w[0] - e[0], w[1] - e[1]) >= 6, 'forearm retains its length');
    }
    assert.equal(upperArms.size, 5, 'the upper arm, not just the forearm, changes angle');
  }
  for (const [id] of source.animations.clips.walk.frames) {
    const pose = resolvePose(source.animations.poses, id);
    assert.equal(36 + pose.offsets.rightArm[0] + 7, 30);
    assert.equal(12 + pose.offsets.leftArm[0] + 15 - 7, 32);
  }
  for (const [id, nearX, farX] of [['walk-a', 2, 2], ['walk-b', 12, 12]]) {
    const pose = resolvePose(source.animations.poses, id);
    const nearTravel = 36 + pose.offsets.rightArm[0] + nearX - 30;
    const farTravel = 12 + pose.offsets.leftArm[0] + 15 - farX - 32;
    assert.equal(Math.sign(nearTravel), -Math.sign(farTravel), 'arms counterbalance in world space');
  }
});

test('walking bones use the resting four-pixel shafts and hands join without a dark wrist seam', () => {
  const source = readAssetSource();
  assert.equal(expandPart(source.parts.arm, 'rest')[15].trim().replaceAll('.', ''), 'khbk');
  assert.equal(expandPart(source.parts.leg, 'rest')[12].replaceAll('.', ''), 'khbk');
  for (const [id, part] of [['arm', source.parts.arm], ['leg', source.parts.leg]]) {
    const variants = Object.keys(part.variants).filter(name => id === 'arm' ? name.includes('swing-')
      : ['contact-a', 'contact-b', 'support-front', 'support-mid', 'support-back', 'lift-back', 'pass', 'reach'].includes(name));
    for (const name of variants) {
      const rows = expandPart(part, name);
      for (let y = id === 'arm' ? 7 : 2; y <= (id === 'arm' ? 10 : 6); y++) {
        assert.equal(rows[y].replaceAll('.', ''), 'khbk', name + ' matches resting shaft width/material');
      }
      if (id !== 'arm') continue;
      const hand = rows.findIndex(row => row.includes('khhbsk'));
      assert.ok(hand > 0);
      assert.equal(rows[hand - 1].replaceAll('.', ''), 'khbk', name + ' has no black wrist cap');
      assert.equal(rows[hand - 2].replaceAll('.', ''), 'khbk', name + ' has an uninterrupted forearm');
    }
  }
});

test('profile ribs widen, cover the far arm and stay behind the near arm in every walking phase', () => {
  const source = readAssetSource();
  const ribs = expandPart(source.parts.ribs, 'profile');
  const width = y => pixelBounds([ribs[y]]).width;
  assert.equal(width(3), 6);
  assert.equal(width(5), 8);
  assert.equal(width(10), 10);
  for (const [id] of source.animations.clips.walk.frames) {
    const pose = resolvePose(source.animations.poses, id);
    assert.ok(pose.drawOrder.indexOf('leftArm') < pose.drawOrder.indexOf('body'));
    assert.ok(pose.drawOrder.indexOf('rightArm') > pose.drawOrder.indexOf('body'));
    const full = composePose(source, 'miga', id);
    const near = expandPart(source.parts.arm, pose.variants.rightArm);
    const far = expandPart(source.parts.arm, pose.variants.leftArm).map(row => [...row].reverse().join(''));
    const mirrored = full.map(row => [...row].reverse().join(''));
    let foregroundChanges = 0, backgroundCovered = 0;
    near.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === '.' || y < 4 || y > 12) return;
      const worldX = 36 + pose.offsets.rightArm[0] + x;
      const worldY = 22 + pose.offsets.rightArm[1] + y;
      const ribX = worldX - 25 - pose.offsets.body[0];
      const ribY = worldY - 22 - pose.offsets.body[1];
      const rib = ribs[ribY]?.[ribX];
      if (rib && rib !== '.') {
        assert.equal(full[worldY][worldX], pixel, id + ' near arm is in front of the ribs');
        assert.equal(mirrored[worldY][63 - worldX], pixel, id + ' near arm remains in front when facing left');
        if (rib !== pixel) foregroundChanges++;
      }
    }));
    far.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === '.' || y < 4 || y > 12) return;
      const worldX = 12 + pose.offsets.leftArm[0] + x;
      const worldY = 22 + pose.offsets.leftArm[1] + y;
      const rib = ribs[worldY - 22 - pose.offsets.body[1]]?.[worldX - 25 - pose.offsets.body[0]];
      const nearPixel = near[worldY - 22 - pose.offsets.rightArm[1]]?.[worldX - 36 - pose.offsets.rightArm[0]];
      if (!rib || rib === '.' || (nearPixel && nearPixel !== '.')) return;
      assert.equal(full[worldY][worldX], rib, id + ' ribs cover the far arm');
      assert.equal(mirrored[worldY][63 - worldX], rib, id + ' far arm remains behind when facing left');
      if (rib !== (pose.remaps.leftArm[pixel] ?? pixel)) backgroundCovered++;
    }));
    assert.ok(foregroundChanges > 0, id + ' has a visibly foreground upper arm');
    assert.ok(backgroundCovered > 0, id + ' has a visibly occluded background upper arm');
  }
});

test('draw order is inherited per pose, leaves the frontal rig unchanged and rejects invalid slot lists', () => {
  const source = readAssetSource();
  assert.deepEqual(resolvePose(source.animations.poses, 'walk-a').drawOrder, source.animations.poses.side.drawOrder);
  assert.equal(resolvePose(source.animations.poses, 'stand').drawOrder, undefined);
  for (const order of [[], ['head'], ['head', 'head', 'body', 'pelvis', 'leftArm', 'leftLeg', 'rightLeg'],
    ['missing', 'body', 'pelvis', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg']]) {
    const broken = structuredClone(source);
    broken.animations.poses.side.drawOrder = order;
    assert.throws(() => validateCatalog(broken), /invalid draw order/);
  }
});

test('independent part rotations are pixel-exact and reversible', () => {
  const rows = ['hbk', '.sk'];
  assert.deepEqual(rotatePixels(rows, 90), ['.h', 'sb', 'kk']);
  assert.deepEqual(rotatePixels(rotatePixels(rows, 90), 270), rows);
});

test('validation rejects malformed loop starts and per-part transforms', () => {
  for (const loopFrom of [-1, 1.5, 999]) {
    const source = readAssetSource(); source.animations.clips.sleep.loopFrom = loopFrom;
    assert.throws(() => validateCatalog(source), /invalid loop start/);
  }
  const rotation = readAssetSource(); rotation.animations.poses.sleep.rotations.body = 30;
  assert.throws(() => validateCatalog(rotation), /invalid part rotation/);
  const recolor = readAssetSource(); recolor.animations.poses.side.remaps.leftArm.h = 'q';
  assert.throws(() => validateCatalog(recolor), /invalid part recolor/);
});

test('waking finishes upright and holds its final frame', () => {
  const catalog = compileCatalog(readAssetSource());
  assert.equal(catalog.characters.miga.clips.wake.loop, false);
  assert.equal(frameAt(catalog.characters.miga.clips.wake, 100).id, 'miga:stand');
  assert.ok(catalog.frames['miga:stand'].bounds.height > catalog.frames['miga:sleep'].bounds.height * 2);
});

test('a one-arm greeting keeps the head, other arm and feet stationary', () => {
  const source = readAssetSource();
  const stand = composePose(source, 'miga', 'stand');
  for (const pose of ['wave-a', 'wave-b']) {
    const moving = composePose(source, 'miga', pose);
    let changes = 0;
    moving.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel !== stand[y][x]) { changes++; assert.ok(x >= 36 && y >= 22 && y < 48); }
    }));
    assert.ok(changes > 0);
  }
});

test('left and right limbs reuse the same sources with independent mirror settings', () => {
  const source = readAssetSource();
  const character = source.characters.characters.miga;
  assert.equal(character.parts.leftArm, character.parts.rightArm);
  assert.equal(character.parts.leftLeg, character.parts.rightLeg);
  source.characters.rig.slots = source.characters.rig.slots.filter(slot => slot.name.endsWith('Arm'));
  const before = JSON.stringify(source);
  const rows = composePose(source, 'miga', 'stand');
  const arm = expandPart(source.parts.arm, 'rest');
  assert.equal(rows[44].slice(12, 28), [...arm[22]].reverse().join(''));
  assert.equal(rows[44].slice(36, 52), arm[22]);
  assert.equal(JSON.stringify(source), before);
});

test('three mouth shapes change only the lower face, not the limbs', () => {
  const source = readAssetSource();
  const variants = ['rest', 'mouth-small', 'mouth-open'].map(variant => expandPart(source.parts.skull, variant));
  assert.equal(new Set(variants.map(rows => rows.join(''))).size, 3);
  variants.forEach(rows => assert.deepEqual(rows.slice(0, 16), variants[0].slice(0, 16)));
  const stand = composePose(source, 'miga', 'stand');
  for (const id of ['mouth-small', 'mouth-open']) {
    const rows = composePose(source, 'miga', id);
    assert.deepEqual(rows.slice(26), stand.slice(26));
    rows.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel !== stand[y][x]) assert.ok(x >= 25 && x < 39 && y >= 20 && y < 26);
    }));
  }
});

test('hit bounds include the taller skull and the sleeping head in both directions', () => {
  const frames = compileCatalog(readAssetSource()).frames;
  const standing = frameBounds(frames['miga:stand']);
  assert.equal(containsPoint(standing, 0, -50), true);
  assert.equal(containsPoint(standing, 0, -75), false);
  for (const direction of [-1, 1]) {
    const sleeping = frameBounds(frames['miga:sleep'], direction);
    assert.equal(containsPoint(sleeping, direction * 24, -8), true);
    assert.equal(containsPoint(sleeping, 0, -50), false);
  }
});

test('the world margin contains every approved pose including sleep', () => {
  const catalog = compileCatalog(readAssetSource());
  for (const [id, frame] of Object.entries(catalog.frames)) {
    if (!id.startsWith('miga:')) continue;
    for (const direction of [-1, 1]) {
      const bounds = frameBounds(frame, direction);
      assert.ok(bounds.left >= -32 && bounds.left + bounds.width <= 32, id);
    }
  }
});

test('validation rejects malformed rotations, per-pose mirrors and additional rig references', () => {
  const rotation = readAssetSource();
  rotation.animations.poses.sleep.rotation = 45;
  assert.throws(() => validateCatalog(rotation), /invalid rotation/);
  const mirror = readAssetSource();
  mirror.animations.poses.side.mirrors.leftArm = 'yes';
  assert.throws(() => validateCatalog(mirror), /invalid mirror/);
  const unknown = readAssetSource();
  unknown.characters.characters.miga.rig = 'missing';
  assert.throws(() => validateCatalog(unknown), /unknown rig/);
});
