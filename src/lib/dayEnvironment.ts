import { EnvItem } from "./environment";

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
    const random = rng(137);

    // Trees — more spread out, different positions
    for (let i = 0; i < 300; i++) {
        const x = (random() - 0.5) * 140;
        const z = (random() - 0.5) * 140;

        // Keep center clear for building
        if (Math.abs(x) < 7 && Math.abs(z) < 7) continue;

        // Keep portal area clear (portal at x=-10, z=-28.9)
        const dxP = x - (-10);
        const dzP = z - (-28.9);
        if (dxP * dxP + dzP * dzP < 36) continue;

        const scale = 0.7 + random() * 1.1;
        const variant = Math.floor(random() * 5);

        items.push({
            type: "tree",
            pos: [x, 0, z],
            scale,
            variant,
        });
    }

    // Rocks — different scattering
    for (let i = 0; i < 150; i++) {
        const x = (random() - 0.5) * 138;
        const z = (random() - 0.5) * 138;

        if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;

        // Keep portal area clear
        const dxP = x - (-10);
        const dzP = z - (-28.9);
        if (dxP * dxP + dzP * dzP < 36) continue;

        const scale = 0.4 + random() * 1.0;

        items.push({
            type: "rock",
            pos: [x, scale * 0.15, z],
            scale,
        });
    }

    return items;
}

export const DAY_ENV_PROPS = generateDayEnvironment();
