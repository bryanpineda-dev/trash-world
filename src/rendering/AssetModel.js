const pair = value => Array.isArray(value) && value.length === 2 && value.every(Number.isInteger);
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };

export function paletteOf(style) {
  return Object.fromEntries(Object.entries(style.colors).map(([key, value]) => [key, value.hex]));
}

export function expandPart(part, variant) {
  const pixels = part.pixels.map(row => [...row]);
  for (const patch of part.variants[variant]) {
    patch.pixels.forEach((row, y) => [...row].forEach((pixel, x) => {
      pixels[y + patch.at[1]][x + patch.at[0]] = pixel;
    }));
  }
  return pixels.map(row => row.join(''));
}

export function resolvePose(poses, id, ancestors = []) {
  requireValue(poses[id], `Unknown pose: ${id}`);
  requireValue(!ancestors.includes(id), `Pose inheritance cycle: ${id}`);
  const pose = poses[id];
  const parent = pose.extends ? resolvePose(poses, pose.extends, [...ancestors, id]) : {};
  return {
    variants: { ...parent.variants, ...pose.variants },
    offsets: { ...parent.offsets, ...pose.offsets },
    mirrors: { ...parent.mirrors, ...pose.mirrors },
    rotations: { ...parent.rotations, ...pose.rotations },
    remaps: { ...parent.remaps, ...pose.remaps },
    drawOrder: pose.drawOrder ?? parent.drawOrder,
    offset: pose.offset ?? parent.offset ?? [0, 0],
    rotation: pose.rotation ?? parent.rotation ?? 0,
    grounded: pose.grounded ?? parent.grounded ?? false,
  };
}

export function rotatePixels(rows, rotation = 0) {
  let result = rows;
  for (let angle = 0; angle < rotation; angle += 90) {
    result = Array.from({ length: result[0].length }, (_, y) => result.map(row => row[y]).reverse().join(''));
  }
  return result;
}

export function rigForCharacter(catalog, characterId) {
  const character = catalog.characters.characters[characterId];
  requireValue(character, `Unknown character: ${characterId}`);
  const rig = !character.rig || character.rig === catalog.characters.rig.id
    ? catalog.characters.rig : catalog.characters.rigs?.[character.rig];
  requireValue(rig, `${characterId}: unknown rig '${character.rig}'`);
  return rig;
}

function animationsForRig(catalog, rig) {
  const override = catalog.animations.rigs?.[rig.id];
  return {
    poses: override?.poses ?? catalog.animations.poses,
    clips: { ...catalog.animations.clips, ...override?.clips },
  };
}

export function animationsForCharacter(catalog, characterId) {
  return animationsForRig(catalog, rigForCharacter(catalog, characterId));
}

export function composePose(catalog, characterId, poseId) {
  const rig = rigForCharacter(catalog, characterId);
  const character = catalog.characters.characters[characterId];
  const pose = resolvePose(animationsForRig(catalog, rig).poses, poseId);
  const [width, height] = rig.size;
  const rows = Array.from({ length: height }, () => Array(width).fill('.'));
  const slots = pose.drawOrder ? pose.drawOrder.map(name => {
    const slot = rig.slots.find(entry => entry.name === name);
    requireValue(slot, `${poseId}: unknown draw slot '${name}'`);
    return slot;
  }) : rig.slots;
  for (const slot of slots) {
    let pixels = expandPart(catalog.parts[character.parts[slot.name]], pose.variants[slot.name]);
    if (pose.mirrors[slot.name] ?? slot.mirror) pixels = pixels.map(row => [...row].reverse().join(''));
    pixels = rotatePixels(pixels, pose.rotations[slot.name]);
    const offset = pose.offsets[slot.name] ?? [0, 0];
    const x = slot.at[0] + offset[0] + pose.offset[0];
    const y = slot.at[1] + offset[1] + pose.offset[1];
    pixels.forEach((row, dy) => [...row].forEach((pixel, dx) => {
      if (pixel === '.') return;
      requireValue(x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height,
        `${characterId}/${poseId}: ${slot.name} clips outside ${width}x${height}`);
      const shaded = pose.remaps[slot.name]?.[pixel] ?? pixel;
      rows[y + dy][x + dx] = character.remap?.[shaded] ?? shaded;
    }));
  }
  let result = rotatePixels(rows.map(row => row.join('')), pose.rotation);
  if (pose.grounded) {
    const bounds = pixelBounds(result);
    const dx = rig.anchor[0] - Math.floor(bounds.width / 2) - bounds.x;
    const dy = rig.anchor[1] - bounds.y - bounds.height;
    const aligned = Array.from({ length: height }, () => Array(width).fill('.'));
    result.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === '.') return;
      requireValue(x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height,
        `${characterId}/${poseId}: rotated pose clips outside ${width}x${height}`);
      aligned[y + dy][x + dx] = pixel;
    }));
    result = aligned.map(row => row.join(''));
  }
  return result;
}

export function pixelBounds(rows) {
  let left = rows[0].length, top = rows.length, right = -1, bottom = -1;
  rows.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel !== '.') { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  }));
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export function frameBounds(frame, direction = 1) {
  const bounds = frame.bounds;
  return { left: direction < 0 ? frame.anchor[0] - bounds.x - bounds.width : bounds.x - frame.anchor[0],
    top: bounds.y - frame.anchor[1], width: bounds.width, height: bounds.height };
}

export function containsPoint(bounds, x, y, padding = 4) {
  return x >= bounds.left - padding && x < bounds.left + bounds.width + padding
    && y >= bounds.top - padding && y < bounds.top + bounds.height + padding;
}

export function clipTime(clip, seconds) {
  const total = clip.frames.reduce((sum, frame) => sum + frame.duration, 0);
  let elapsed = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : 0;
  if (!clip.loop) return Math.min(elapsed, total) / 1000;
  const intro = clip.frames.slice(0, clip.loopFrom ?? 0).reduce((sum, frame) => sum + frame.duration, 0);
  if (elapsed >= intro) elapsed = intro + (elapsed - intro) % (total - intro);
  return elapsed / 1000;
}

export function frameAt(clip, seconds) {
  let elapsed = clipTime(clip, seconds) * 1000;
  for (const frame of clip.frames) {
    if (elapsed < frame.duration) return frame;
    elapsed -= frame.duration;
  }
  return clip.frames[clip.frames.length - 1];
}

export function compileCatalog(catalog) {
  validateCatalog(catalog);
  const frames = {};
  const characters = {};
  for (const [id, character] of Object.entries(catalog.characters.characters)) {
    const clips = {};
    const rig = rigForCharacter(catalog, id);
    for (const [clipId, clip] of Object.entries(animationsForRig(catalog, rig).clips)) {
      clips[clipId] = { label: clip.label, loop: clip.loop, ...(clip.loopFrom === undefined ? {} : { loopFrom: clip.loopFrom }), frames: clip.frames.map(([pose, duration]) => {
        const frameId = `${id}:${pose}`;
        frames[frameId] ??= { pixels: composePose(catalog, id, pose), anchor: rig.anchor };
        return { id: frameId, duration };
      }) };
    }
    characters[id] = { label: character.label, clips };
  }
  const objects = {};
  for (const [id, object] of Object.entries(catalog.characters.objects)) {
    objects[id] = { label: object.label, loop: object.loop, frames: object.frames.map(([variant, duration]) => {
      const frameId = `object:${id}:${variant}`;
      frames[frameId] = { pixels: expandPart(catalog.parts[object.part], variant), anchor: object.anchor };
      return { id: frameId, duration };
    }) };
  }
  for (const [id, part] of Object.entries(catalog.parts)) {
    for (const variant of Object.keys(part.variants)) {
      frames[`part:${id}:${variant}`] = { pixels: expandPart(part, variant), anchor: [0, 0] };
    }
  }
  for (const frame of Object.values(frames)) frame.bounds = pixelBounds(frame.pixels);
  return { style: catalog.style.id, palette: paletteOf(catalog.style), states: catalog.animations.states, characters, objects, frames };
}

export function validateCatalog(catalog) {
  const { style, parts, characters, animations } = catalog;
  requireValue(style.version === 1 && style.transparent === '.', 'Unsupported style version');
  requireValue(pair(style.maxSize) && style.maxSize.every(value => value > 0 && value <= 128), 'Invalid size limit');
  const colors = Object.keys(style.colors);
  requireValue(colors.length > 0 && colors.length <= 16, 'Palette must contain 1 to 16 colors');
  for (const key of colors) {
    requireValue(/^[a-z]$/.test(key) && /^#[\da-f]{6}$/i.test(style.colors[key].hex), `Invalid palette color: ${key}`);
  }
  const legal = new Set(['.', ...colors]);
  const validateRows = (rows, width, label) => {
    requireValue(Array.isArray(rows) && rows.length > 0, `${label}: empty pixels`);
    rows.forEach((row, index) => {
      requireValue(typeof row === 'string' && row.length === width, `${label}: row ${index} must have ${width} pixels`);
      for (const pixel of row) requireValue(legal.has(pixel), `${label}: color '${pixel}' is outside the palette`);
    });
  };
  for (const [id, part] of Object.entries(parts)) {
    requireValue(pair(part.size) && part.size.every((value, index) => value > 0 && value <= style.maxSize[index]), `${id}: invalid dimensions`);
    validateRows(part.pixels, part.size[0], id);
    requireValue(part.pixels.length === part.size[1], `${id}: incorrect height`);
    requireValue(part.variants && Object.keys(part.variants).length > 0, `${id}: missing variants`);
    for (const [variant, patches] of Object.entries(part.variants)) {
      requireValue(Array.isArray(patches), `${id}/${variant}: invalid patches`);
      for (const patch of patches) {
        requireValue(pair(patch.at), `${id}/${variant}: fractional patch origin`);
        validateRows(patch.pixels, patch.pixels?.[0]?.length, `${id}/${variant}`);
        requireValue(patch.at[0] >= 0 && patch.at[1] >= 0 && patch.at[0] + patch.pixels[0].length <= part.size[0]
          && patch.at[1] + patch.pixels.length <= part.size[1], `${id}/${variant}: patch outside source`);
      }
    }
  }
  const validateSequence = (frames, choices, label) => {
    requireValue(Array.isArray(frames) && frames.length > 0, `${label}: empty sequence`);
    for (const entry of frames) requireValue(Array.isArray(entry) && entry.length === 2 && choices.has(entry[0])
      && Number.isInteger(entry[1]) && entry[1] >= 40 && entry[1] <= 10000, `${label}: invalid frame or duration`);
  };
  const rigs = [characters.rig, ...Object.values(characters.rigs ?? {})];
  requireValue(new Set(rigs.map(rig => rig.id)).size === rigs.length, 'Duplicate rig IDs');
  for (const [id, rig] of Object.entries(characters.rigs ?? {})) requireValue(rig.id === id, `${id}: rig ID mismatch`);
  for (const id of Object.keys(animations.rigs ?? {})) requireValue(rigs.some(rig => rig.id === id), `${id}: unknown animation rig`);
  for (const rig of rigs) {
    requireValue(pair(rig.size) && pair(rig.anchor), 'Invalid rig size or anchor');
    requireValue(rig.size.every((value, index) => value > 0 && value <= style.maxSize[index]), 'Rig exceeds size limit');
    requireValue(rig.anchor.every((value, index) => value >= 0 && value <= rig.size[index]), 'Rig anchor outside canvas');
    requireValue(Array.isArray(rig.slots) && rig.slots.length > 0, 'Empty rig');
    const slots = new Set(rig.slots.map(slot => slot.name));
    requireValue(slots.size === rig.slots.length, 'Duplicate rig slots');
    rig.slots.forEach(slot => {
      requireValue(pair(slot.at), `${slot.name}: fractional rig origin`);
      requireValue(slot.mirror === undefined || typeof slot.mirror === 'boolean', `${slot.name}: invalid mirror flag`);
    });
    const set = animationsForRig(catalog, rig);
    for (const [id, rawPose] of Object.entries(set.poses)) {
      const pose = resolvePose(set.poses, id);
      requireValue(pair(pose.offset), `${id}: fractional pose offset`);
      requireValue([0, 90, 180, 270].includes(pose.rotation), `${id}: invalid rotation`);
      requireValue(pose.rotation === 0 || rig.size[0] === rig.size[1], `${id}: rotation requires a square rig`);
      requireValue(typeof pose.grounded === 'boolean', `${id}: invalid grounded flag`);
      requireValue(pose.drawOrder === undefined || (Array.isArray(pose.drawOrder)
        && pose.drawOrder.length === slots.size && new Set(pose.drawOrder).size === slots.size
        && pose.drawOrder.every(slot => slots.has(slot))), `${id}: invalid draw order`);
      for (const [slot, mirror] of Object.entries(pose.mirrors)) {
        requireValue(slots.has(slot) && typeof mirror === 'boolean', `${id}: invalid mirror for '${slot}'`);
      }
      for (const [slot, rotation] of Object.entries(pose.rotations)) {
        requireValue(slots.has(slot) && [0, 90, 180, 270].includes(rotation), `${id}: invalid part rotation for '${slot}'`);
      }
      for (const [slot, remap] of Object.entries(pose.remaps)) {
        requireValue(slots.has(slot) && remap && typeof remap === 'object' && !Array.isArray(remap), `${id}: invalid part recolor`);
        for (const [from, to] of Object.entries(remap)) requireValue(legal.has(from) && legal.has(to) && from !== '.' && to !== '.', `${id}: invalid part recolor`);
      }
      for (const key of Object.keys(rawPose.variants ?? {})) requireValue(slots.has(key), `${id}: unknown slot '${key}'`);
      for (const [slot, offset] of Object.entries(pose.offsets)) {
        requireValue(slots.has(slot) && pair(offset), `${id}: invalid offset for '${slot}'`);
      }
    }
    for (const [id, clip] of Object.entries(set.clips)) {
      requireValue(typeof clip.loop === 'boolean', `${id}: missing loop flag`);
      validateSequence(clip.frames, new Set(Object.keys(set.poses)), id);
      requireValue(clip.loopFrom === undefined || (clip.loop && Number.isInteger(clip.loopFrom)
        && clip.loopFrom >= 0 && clip.loopFrom < clip.frames.length), `${id}: invalid loop start`);
    }
    for (const [state, clip] of Object.entries(animations.states)) requireValue(set.clips[clip], `${state}: unknown clip`);
  }
  for (const [id, character] of Object.entries(characters.characters)) {
    const rig = rigForCharacter(catalog, id);
    const set = animationsForRig(catalog, rig);
    for (const [from, to] of Object.entries(character.remap ?? {})) requireValue(legal.has(from) && legal.has(to) && from !== '.' && to !== '.', `${id}: invalid recolor`);
    for (const poseId of Object.keys(set.poses)) {
      const pose = resolvePose(set.poses, poseId);
      for (const slot of rig.slots) {
        const part = parts[character.parts[slot.name]];
        requireValue(part && Array.isArray(part.variants[pose.variants[slot.name]]), `${id}/${poseId}: missing ${slot.name} variant`);
      }
      composePose(catalog, id, poseId);
    }
  }
  for (const [id, object] of Object.entries(characters.objects)) {
    const part = parts[object.part];
    requireValue(part && pair(object.anchor) && typeof object.loop === 'boolean', `${id}: invalid object`);
    requireValue(object.anchor.every((value, index) => value >= 0 && value <= part.size[index]), `${id}: invalid object anchor`);
    validateSequence(object.frames, new Set(Object.keys(part.variants)), id);
  }
  return true;
}
