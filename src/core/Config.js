export const WORLD_WIDTH = 560;
export const CREATURE_MARGIN = 32;
export const FIXED_STEP = 1 / 30;
export const DAY_SECONDS = 24 * 60;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
export const SAVE_KEY = 'trash-world.save';
export const SAVE_VERSION = 1;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
