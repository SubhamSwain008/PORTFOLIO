import { EnvItem } from "./environment";
import { DAY_ENV } from "../components/settings/settings";

// Generate a DIFFERENT deterministic environment layout for the daytime realm
function generateDayEnvironment(): EnvItem[] {
    const items: EnvItem[] = [];

    const rng = (seed: number) => {
        let s = seed;
        return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    };

    // Different seed = different world layout
    const random = rng(DAY_ENV.SEED);

    // Trees — more spread out, different positions
    for (let i = 0; i < DAY_ENV.TREE_COUNT; i++) {
        const x = (random() - 0.5) * DAY_ENV.SPREAD;
        const z = (random() - 0.5) * DAY_ENV.SPREAD;

        // Keep center clear for building
        if (Math.abs(x) < DAY_ENV.BUILDING_EXCLUSION && Math.abs(z) < DAY_ENV.BUILDING_EXCLUSION) continue;

        // Keep portal area clear
        const dxP = x - DAY_ENV.PORTAL_EXCLUSION_CENTER[0];
        const dzP = z - DAY_ENV.PORTAL_EXCLUSION_CENTER[1];
        if (dxP * dxP + dzP * dzP < DAY_ENV.PORTAL_EXCLUSION_RADIUS * DAY_ENV.PORTAL_EXCLUSION_RADIUS) continue;

        const scale = DAY_ENV.TREE_SCALE_MIN + random() * DAY_ENV.TREE_SCALE_RANGE;
        const variant = Math.floor(random() * DAY_ENV.TREE_VARIANTS);

        items.push({
            type: "tree",
            pos: [x, 0, z],
            scale,
            variant,
        });
    }

    // Rocks — different scattering
    for (let i = 0; i < DAY_ENV.ROCK_COUNT; i++) {
        const x = (random() - 0.5) * DAY_ENV.SPREAD;
        const z = (random() - 0.5) * DAY_ENV.SPREAD;

        if (Math.abs(x) < DAY_ENV.ROCK_BUILDING_EXCLUSION && Math.abs(z) < DAY_ENV.ROCK_BUILDING_EXCLUSION) continue;

        // Keep portal area clear
        const dxP = x - DAY_ENV.PORTAL_EXCLUSION_CENTER[0];
        const dzP = z - DAY_ENV.PORTAL_EXCLUSION_CENTER[1];
        if (dxP * dxP + dzP * dzP < DAY_ENV.PORTAL_EXCLUSION_RADIUS * DAY_ENV.PORTAL_EXCLUSION_RADIUS) continue;

        const scale = DAY_ENV.ROCK_SCALE_MIN + random() * DAY_ENV.ROCK_SCALE_RANGE;

        items.push({
            type: "rock",
            pos: [x, scale * DAY_ENV.ROCK_Y_MULT, z],
            scale,
        });
    }

    return items;
}

export const DAY_ENV_PROPS = generateDayEnvironment();
