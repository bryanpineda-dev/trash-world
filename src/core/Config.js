export const WORLD_LEFT = -560;
export const WORLD_RIGHT = 1120;
export const WORLD_WIDTH = WORLD_RIGHT - WORLD_LEFT;
export const VIEW_WIDTH = 560;
export const CREATURE_MARGIN = 32;
export const FIXED_STEP = 1 / 30;
export const DAY_SECONDS = 24 * 60;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
export const SAVE_KEY = 'trash-world.save';
export const SAVE_VERSION = 1;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
