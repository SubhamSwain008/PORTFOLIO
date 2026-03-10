/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    MASTER CONTROL SETTINGS                       ║
 * ║  Central configuration for both Night & Day worlds.              ║
 * ║  Change values here to tune gameplay — all files read from this. ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  PLAYER MOVEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAYER = {
  /** Base walking speed (units per second) */
  WALK_SPEED: 7,
  /** Rotation speed (radians per second) */
  ROT_SPEED: 2.5,
  /** Backward movement multiplier (negative = reverse) */
  BACKPEDAL_MULTIPLIER: -0.5,
  /** Acceleration lerp rate (higher = snappier) */
  ACCEL_RATE: 12,
  /** Deceleration lerp rate */
  DECEL_RATE: 10,
  /** Velocity below this is treated as zero */
  VELOCITY_STOP_THRESHOLD: 0.05,
  /** Player collision capsule radius */
  COLLISION_RADIUS: 0.3,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  STAMINA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const STAMINA = {
  /** Maximum stamina value */
  MAX: 100,
  /** Stamina drain per second while sprinting */
  DRAIN_PER_SECOND: 5,
  /** Seconds to fully recover stamina from 0 */
  RECOVERY_SECONDS: 30,
  /** Sprint speed multiplier at full stamina */
  SPRINT_MAX_MULTIPLIER: 2.0,
  /**
   * Stamina threshold for full sprint speed.
   * Above this → full multiplier. Below → linearly scales to 1×.
   */
  SPRINT_THRESHOLD: 50,
  /** Hide stamina bar when stamina >= this value */
  BAR_HIDE_THRESHOLD: 99.9,
} as const;

/** Derived: stamina recovery per second */
export const STAMINA_RECOVERY_RATE = STAMINA.MAX / STAMINA.RECOVERY_SECONDS;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  HUNGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HUNGER = {
  /** Seconds for hunger to drain from 100 → 0 */
  DRAIN_DURATION: 900, // 15 minutes
  /** Below this %, stamina is locked to 0 */
  STAMINA_LOCK_THRESHOLD: 30,
  /** DB save interval in milliseconds */
  DB_SAVE_INTERVAL: 60_000,
} as const;

/** Derived: hunger drop per second */
export const HUNGER_DRAIN_PER_SECOND = 100 / HUNGER.DRAIN_DURATION;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  HEALTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH = {
  /** Maximum health value */
  MAX: 100,
  /** HP lost per second when hunger is 0 */
  DRAIN_PER_SECOND: 0.5,
  /** DB save interval in milliseconds */
  DB_SAVE_INTERVAL: 60_000,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  WORLD BOUNDS & COLLISION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const WORLD = {
  /** Max distance from center the player can walk (±) */
  BOUNDS: 400,
  /** Building collision half-width (X and Z) */
  BUILDING_HALF_X: 4.8,
  BUILDING_HALF_Z: 4.8,
  /** Fence perimeter distance from world center */
  FENCE_DISTANCE: 35,
  /** Gate opening half-width (full gate = 2 × this) */
  GATE_HALF_WIDTH: 4,
  /** Push-back offset when hitting a wall/fence */
  WALL_PUSH: 0.2,
  /** Tree collision radius */
  TREE_COLLISION_RADIUS: 0.4,
  /** Rock collision base radius (multiplied by item scale × 0.8) */
  ROCK_COLLISION_BASE: 0.4,
  ROCK_COLLISION_SCALE_MULT: 0.8,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  GATE & PORTAL POSITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GATE = {
  /** How close the player must be to trigger gate prompt */
  DETECT_RADIUS: 4,
  /** Auto-walk speed through a gate as a fraction of WALK_SPEED */
  CROSSING_SPEED_MULT: 0.8,
  /** Distance to auto-walk through a gate (units) */
  WALK_THROUGH_DISTANCE: 6,
  /** Gate positions: [x, y, z] of each fence gate center */
  POSITIONS: [
    { pos: [0, 0, -35] as const, dir: [0, 0, -1] as const, axis: "z" as const },  // North
    { pos: [0, 0, 35] as const, dir: [0, 0, 1] as const, axis: "z" as const },     // South
    { pos: [-35, 0, 0] as const, dir: [-1, 0, 0] as const, axis: "x" as const },   // West
    { pos: [35, 0, 0] as const, dir: [1, 0, 0] as const, axis: "x" as const },     // East
  ],
} as const;

export const PORTAL = {
  /** Entrance detection radius for both door and portal */
  ENTRANCE_RADIUS: 4,
  /** Building door position */
  DOOR_POS: [0, 0, 4.5] as const,
  /** Portal position (behind main hall) */
  PORTAL_POS: [0, 0, -4.01] as const,
  /** Portal video start/stop distance from camera */
  VIDEO_DISTANCE: 60,
  /** Default spawn position (new players) */
  DEFAULT_SPAWN: [0, 1.3, 8] as const,
  /** Spawn position when arriving through portal */
  PORTAL_ARRIVAL_SPAWN: [-10, 1.3, -40] as const,
  /** Z position of the day-portal billboard prompt */
  BILLBOARD_Z: -44.9,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  ENVIRONMENT: TREES, ROCKS, GRASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NIGHT_ENV = {
  /** Deterministic RNG seed for night placement */
  SEED: 42,
  /** Number of tree generation attempts */
  TREE_COUNT: 2000,
  /** World area spread for trees/rocks (±spread/2 from center) */
  SPREAD: 800,
  /** Minimum distance from center to allow trees */
  BUILDING_EXCLUSION: 7,
  /** Portal exclusion center (x, z) */
  PORTAL_EXCLUSION_CENTER: [-10, -44.9] as const,
  /** Portal exclusion radius */
  PORTAL_EXCLUSION_RADIUS: 6,
  /** Tree scale range: min + random * range */
  TREE_SCALE_MIN: 0.6,
  TREE_SCALE_RANGE: 1.0,
  /** Number of tree visual variants */
  TREE_VARIANTS: 10,
  /** Number of rock generation attempts */
  ROCK_COUNT: 600,
  /** Rock exclusion distance from building center */
  ROCK_BUILDING_EXCLUSION: 6,
  /** Rock scale range */
  ROCK_SCALE_MIN: 0.5,
  ROCK_SCALE_RANGE: 1.2,
  /** Rock Y offset multiplier (scale × this) */
  ROCK_Y_MULT: 0.15,
  /** Grass blade count */
  GRASS_COUNT: 12000,
  /** Grass base color */
  GRASS_COLOR: "#0d1a0e",
} as const;

export const DAY_ENV = {
  /** Deterministic RNG seed for day placement */
  SEED: 137,
  /** Number of tree generation attempts */
  TREE_COUNT: 2000,
  SPREAD: 800,
  BUILDING_EXCLUSION: 7,
  PORTAL_EXCLUSION_CENTER: [-10, -44.9] as const,
  PORTAL_EXCLUSION_RADIUS: 6,
  /** Tree scale range (slightly larger than night) */
  TREE_SCALE_MIN: 0.7,
  TREE_SCALE_RANGE: 1.1,
  TREE_VARIANTS: 10,
  ROCK_COUNT: 600,
  ROCK_BUILDING_EXCLUSION: 6,
  /** Rock scale (slightly smaller than night) */
  ROCK_SCALE_MIN: 0.4,
  ROCK_SCALE_RANGE: 1.0,
  ROCK_Y_MULT: 0.15,
  /** Grass blade count (more lush than night) */
  GRASS_COUNT: 14000,
  /** Grass base color */
  GRASS_COLOR: "#2a5e1a",
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  INVENTORY & ITEM SPAWNING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const INVENTORY = {
  /**
   * GLOBAL ITEM CAP: total items across both worlds + player inventory
   * must be strictly less than this number.
   * day spawned + night spawned + player inventory < MAX_TOTAL_ITEMS
   */
  MAX_TOTAL_ITEMS: 120,

  /** World spread for item placement (±SPREAD from center) */
  WORLD_SPREAD: 380,
  /** Exclusion radius² around building center (skip items inside) */
  BUILDING_EXCLUSION_SQ: 104,   // 8-unit radius
  /** Portal exclusion center for item spawning */
  PORTAL_EXCLUSION_X: -10,
  PORTAL_EXCLUSION_Z: -44.9,
  /** Portal exclusion radius² */
  PORTAL_EXCLUSION_SQ: 49,     // 7-unit radius
  /** Gate exclusion half-size (items can't spawn too near gates) */
  GATE_EXCLUSION_HALF: 10,
  /** Max random placement attempts per item before giving up */
  MAX_SPAWN_ATTEMPTS: 50,
  /** Y height at which items float above the ground */
  SPAWN_Y: 0.5,

  /**
   * Day world item multiplier. 1.0 = same as night, 0.2 = 20%.
   * Controls how maxSpawn is scaled for the day world.
   */
  DAY_SPAWN_MULTIPLIER: 0.5,


  ///kkkkkkk
  /** Pickup distance — how close player must be to collect */
  COLLECT_RADIUS: 3.5,
  /** Distance² to show full 3D models (beyond this → indicator only) */
  MODEL_RADIUS_SQ: 11 * 11,
  /** Distance² beyond which items are fully invisible */
  VISIBILITY_RADIUS_SQ: 60 * 60,
  /** Max instanced indicators (performance cap) */
  MAX_INSTANCES: 80,
  /** Indicator orb radius */
  INDICATOR_RADIUS: 0.2,
  /** Indicator hover height and bob amplitude */
  INDICATOR_BASE_Y: 0.6,
  INDICATOR_BOB_AMPLITUDE: 0.15,
  INDICATOR_BOB_SPEED: 2.0,
  /** How often to refresh nearby-model list (every N frames) */
  MODEL_UPDATE_INTERVAL: 12,
} as const;

/**
 * Per-item spawn configuration.
 * `maxSpawn` is the base spawn count for night world.
 * Day world gets floor(maxSpawn × DAY_SPAWN_MULTIPLIER).
 *
 * `probability` controls relative rarity (higher = more common).
 * This is a weight — actual spawn count = floor(maxSpawn × probability).
 * Set to 1.0 for normal spawning. 0.5 = half as likely. 0 = disabled.
 */
export const ITEM_SPAWN_CONFIG: Record<string, { maxSpawn: number; probability: number }> = {
  // ── Foods (plentiful across the large world) ──
  mystic_apple:    { maxSpawn: 12, probability: 1.0 },
  golden_bread:    { maxSpawn: 12, probability: 1.0 },
  shadow_mushroom: { maxSpawn: 12, probability: 1.0 },
  ember_berry:     { maxSpawn: 12, probability: 1.0 },
  moon_cheese:     { maxSpawn: 10, probability: 1.0 },
  // ── Tools ──
  crystal_pickaxe: { maxSpawn: 4, probability: 1.0 },
  torch:           { maxSpawn: 4, probability: 1.0 },
  ancient_compass: { maxSpawn: 2, probability: 1.0 },
  // ── Medicine ──
  health_potion:   { maxSpawn: 6, probability: 1.0 },
  healing_herb:    { maxSpawn: 8, probability: 1.0 },
  antidote_vial:   { maxSpawn: 4, probability: 1.0 },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  CAMERA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CAMERA = {
  /** Camera vertical height above the player */
  OFFSET_Y: 6,
  /** Camera distance behind the player */
  OFFSET_Z: -8,
  /** Camera position smoothing (lower = smoother follow) */
  POSITION_LERP: 0.05,
  /** Height that the camera looks at (above player origin) */
  LOOK_AT_Y: 3,
  /** Look-at smoothing */
  LOOK_AT_LERP: 0.04,
  /** Field of view (degrees) */
  FOV: 55,
  /** Near clipping plane */
  NEAR: 0.1,
  /** Far clipping plane — night */
  FAR_NIGHT: 120,
  /** Far clipping plane — day */
  FAR_DAY: 130,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  LIGHTING & FOG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NIGHT_LIGHTING = {
  BACKGROUND_COLOR: "#0a0a0f",
  FOG_COLOR: "#12141c",
  FOG_NEAR: 12,
  FOG_FAR: 70,
  TONE_MAPPING_EXPOSURE: 1.4,
  AMBIENT_COLOR: "#4a4a65",
  AMBIENT_INTENSITY: 0.5,
  /** Moon (directional) light */
  MOON_COLOR: "#b0c0ff",
  MOON_INTENSITY: 1.8,
  MOON_OFFSET: [15, 30, 10] as const,
  /** Rim light */
  RIM_COLOR: "#7a5a9a",
  RIM_INTENSITY: 0.6,
  /** Warm ground-bounce fill */
  FILL_INTENSITY: 0.35,
  /** Hemisphere */
  HEMI_SKY: "#445577",
  HEMI_GROUND: "#1a1520",
  HEMI_INTENSITY: 0.4,
  /** Shadow */
  SHADOW_MAP_SIZE: 512,
  SHADOW_CAMERA_BOUNDS: 20,
  SHADOW_NEAR: 0.5,
  SHADOW_FAR: 60,
  SHADOW_BIAS: -0.0005,
} as const;

export const DAY_LIGHTING = {
  FOG_COLOR: "#c0daf0",
  FOG_NEAR: 16,
  FOG_FAR: 45,
  BACKGROUND_COLOR: "#c0daf0",
  TONE_MAPPING_EXPOSURE: 1.6,
  AMBIENT_COLOR: "#fffbe6",
  AMBIENT_INTENSITY: 2.0,
  /** Sun (directional) light */
  SUN_COLOR: "#fff5dd",
  SUN_INTENSITY: 3.5,
  SUN_OFFSET: [20, 40, 15] as const,
  /** Hemisphere */
  HEMI_SKY: "#88bbff",
  HEMI_GROUND: "#4a6a3a",
  HEMI_INTENSITY: 1.1,
  /** Shadow */
  SHADOW_MAP_SIZE: 512,
  SHADOW_CAMERA_BOUNDS: 20,
  SHADOW_NEAR: 0.5,
  SHADOW_FAR: 80,
  SHADOW_BIAS: -0.0003,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  FLASHLIGHT (Night only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FLASHLIGHT = {
  BASE_INTENSITY: 66,
  DISTANCE: 220,
  ANGLE: 0.38,
  PENUMBRA: 0.6,
  DECAY: 1.0,
  AIM_DISTANCE: 12,
  RESTING_TILT: 0.25,
  SHADOW_MAP_SIZE: 2048,
  SHADOW_BIAS: -0.001,
  /** Overhead fill light above player */
  OVERHEAD_COLOR: "#8888cc",
  OVERHEAD_INTENSITY: 5.5,
  OVERHEAD_DISTANCE: 18,
  OVERHEAD_DECAY: 0.5,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  WALK ANIMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const WALK_ANIM = {
  /** Walk cycle frequency multiplier */
  FREQUENCY: 9,
  /** Walk cycle dampening when stopped */
  DECAY: 0.08,
  /** Body vertical bounce */
  BODY_BOB: 0.03,
  /** Body horizontal sway */
  BODY_SWAY: 0.015,
  /** Head Z sway amplitude */
  HEAD_SWAY_Z: 0.03,
  /** Head X nod amplitude */
  HEAD_NOD_X: 0.015,
  /** Arm swing amplitude (left arm) */
  ARM_SWING: 0.5,
  /** Right arm reduced swing (holds flashlight) */
  ARM_SWING_RIGHT: 0.4,
  /** Leg swing amplitude */
  LEG_SWING: 0.55,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  AUTO-SAVE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AUTOSAVE = {
  /** Position auto-save interval in milliseconds */
  INTERVAL_MS: 20_000,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  SCENE TRANSITION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TRANSITION = {
  /** Fade to black duration in seconds */
  FADE_DURATION: 0.7,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  BUILDING (Main Hall)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BUILDING = {
  WIDTH: 8,
  DEPTH: 8,
  HEIGHT: 7,
  WALL_THICKNESS: 0.5,
  DOOR_WIDTH: 2,
  DOOR_HEIGHT: 4,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  HALL INTERIOR (Night Hall)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HALL_INTERIOR = {
  /** Interior room dimensions (slightly smaller than building exterior) */
  ROOM_WIDTH: 18,
  ROOM_DEPTH: 17,
  ROOM_HEIGHT: 6,
  WALL_THICKNESS: 0.3,

  /** Floor material */
  FLOOR_COLOR: "#3a2a1a",

  /** Player spawn position inside the room */
  SPAWN_POS: [0, 0.6, 7.5] as const,
  /** Player spawn facing angle (facing into the room) */
  SPAWN_ANGLE: Math.PI,

  /** Exit door trigger zone */
  EXIT_POS: [0, 0, 8.0] as const,
  EXIT_RADIUS: 1.5,

  /** Bed position (corner) */
  BED_POS: [-7.5, 0, -6.5] as const,

  /** Fireplace position (back wall center) */
  FIREPLACE_POS: [0, 0, -8.3] as const,

  /** Dining table position (center of room) */
  TABLE_POS: [0, 0, 0] as const,
  /** Table proximity radius for eating */
  TABLE_RADIUS: 3.5,

  /** Lighting */
  AMBIENT_COLOR: "#ffead2",
  AMBIENT_INTENSITY: 8.0,
  FIRE_COLOR: "#ffa722ff",
  FIRE_INTENSITY: 12,
  FIRE_DISTANCE: 10,

  /** Camera settings for interior */
  CAM_OFFSET_Y: 6,
  CAM_OFFSET_Z: -7,
  CAM_FOV: 60,
  CAM_LERP: 0.06,

  /** Player walk speed (slower indoors) */
  WALK_SPEED: 4,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  GRASS DETAIL (InstancedGrass)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GRASS = {
  /** Extra blades spawned around each tree */
  BLADES_PER_TREE: 55,
  /** Base blade dimensions */
  BLADE_WIDTH: 0.25,
  BLADE_HEIGHT: 0.9,
  /** Blade tip taper (0–1, higher = more pointed) */
  TAPER: 0.9,
  /** Blade curve at tip */
  CURVE: 0.08,
  /** Number of grass clusters across the map */
  NUM_CLUSTERS: 200,
  /** Cluster center spread */
  CLUSTER_SPREAD: 500,
  /** Cluster radius power/falloff */
  CLUSTER_RADIUS_POWER: 1.8,
  CLUSTER_RADIUS_MAX: 5.0,
  /** Skip grass within this distance² of center */
  BUILDING_EXCLUSION_SQ: 100,
  /** Blade scale Y range */
  SCALE_Y_MIN: 0.6,
  SCALE_Y_RANGE: 1.0,
  /** Blade scale X range */
  SCALE_X_MIN: 0.5,
  SCALE_X_RANGE: 0.8,
  /** Tree-surrounding grass scatter range */
  TREE_SCATTER_MIN: 0.5,
  TREE_SCATTER_RANGE: 2.5,
  TREE_SCALE_Y_MIN: 0.5,
  TREE_SCALE_Y_RANGE: 0.9,
  TREE_SCALE_X_MIN: 0.5,
  TREE_SCALE_X_RANGE: 0.7,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  FENCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FENCE = {
  HALF_SIZE: 35,
  SEGMENT_WIDTH: 4,
  GATE_HALF_WIDTH: 4,
  PICKETS_PER_SEGMENT: 4,
  RAIL_TOP_Y: 0.8,
  RAIL_BOTTOM_Y: 0.35,
  PICKET_BASE_HEIGHT: 1.03,
  PICKET_HEIGHT_VARIATION: 0.2,
  /** Night colors */
  NIGHT_RAIL_COLOR: "#7a7c80",
  NIGHT_PICKET_COLOR: "#6b6d73",
  /** Day colors */
  DAY_RAIL_COLOR: "#5e341b",
  DAY_PICKET_COLOR: "#5a3922",
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  AUDIO & WORLD SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AUDIO = {
  DEFAULT_VOLUME: 80,
  DEFAULT_BRIGHTNESS: 50,
  /** Brightness filter range: min + (value/100) × range */
  BRIGHTNESS_MIN: 0.3,
  BRIGHTNESS_RANGE: 1.5,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  MINIMAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MINIMAP = {
  /** Size in pixels */
  SIZE: 100,
  /** Distance² at which hall arrow starts to fade */
  HALL_FADE_DISTANCE_SQ: 25,
} as const;
