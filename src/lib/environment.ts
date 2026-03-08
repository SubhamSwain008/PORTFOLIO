import { NIGHT_ENV } from "../components/settings/settings";

export interface EnvItem {
    type: "tree" | "rock";
    pos: [number, number, number];
    scale?: number;
    variant?: number;
}

// Generate the determinist environment layout
function generateEnvironment(): EnvItem[] {
    const items: EnvItem[] = [];

    const rng = (seed: number) => {
        let s = seed;
        return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    };

    const random = rng(NIGHT_ENV.SEED);

    // Trees
    for (let i = 0; i < NIGHT_ENV.TREE_COUNT; i++) {
        const x = (random() - 0.5) * NIGHT_ENV.SPREAD;
        const z = (random() - 0.5) * NIGHT_ENV.SPREAD;

        if (Math.abs(x) < NIGHT_ENV.BUILDING_EXCLUSION && Math.abs(z) < NIGHT_ENV.BUILDING_EXCLUSION) continue;

        // Keep portal area clear
        const dxP = x - NIGHT_ENV.PORTAL_EXCLUSION_CENTER[0];
        const dzP = z - NIGHT_ENV.PORTAL_EXCLUSION_CENTER[1];
        if (dxP * dxP + dzP * dzP < NIGHT_ENV.PORTAL_EXCLUSION_RADIUS * NIGHT_ENV.PORTAL_EXCLUSION_RADIUS) continue;

        const scale = NIGHT_ENV.TREE_SCALE_MIN + random() * NIGHT_ENV.TREE_SCALE_RANGE;
        const variant = Math.floor(random() * NIGHT_ENV.TREE_VARIANTS);

        items.push({
            type: "tree",
            pos: [x, 0, z],
            scale,
            variant,
        });
    }

    // Rocks
    for (let i = 0; i < NIGHT_ENV.ROCK_COUNT; i++) {
        const x = (random() - 0.5) * NIGHT_ENV.SPREAD;
        const z = (random() - 0.5) * NIGHT_ENV.SPREAD;

        if (Math.abs(x) < NIGHT_ENV.ROCK_BUILDING_EXCLUSION && Math.abs(z) < NIGHT_ENV.ROCK_BUILDING_EXCLUSION) continue;

        // Keep portal area clear
        const dxP = x - NIGHT_ENV.PORTAL_EXCLUSION_CENTER[0];
        const dzP = z - NIGHT_ENV.PORTAL_EXCLUSION_CENTER[1];
        if (dxP * dxP + dzP * dzP < NIGHT_ENV.PORTAL_EXCLUSION_RADIUS * NIGHT_ENV.PORTAL_EXCLUSION_RADIUS) continue;

        const scale = NIGHT_ENV.ROCK_SCALE_MIN + random() * NIGHT_ENV.ROCK_SCALE_RANGE;

        items.push({
            type: "rock",
            pos: [x, scale * NIGHT_ENV.ROCK_Y_MULT, z],
            scale,
        });
    }

    return items;
}

export const ENV_PROPS = generateEnvironment();
