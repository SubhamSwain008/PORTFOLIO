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

    const random = rng(42);

    // Trees
    for (let i = 0; i < 500; i++) {
        const x = (random() - 0.5) * 440;
        const z = (random() - 0.5) * 440;

        if (Math.abs(x) < 7 && Math.abs(z) < 7) continue;

        // Keep portal area clear (portal at x=-10, z=-28.9)
        const dxP = x - (-10);
        const dzP = z - (-44.9);
        if (dxP * dxP + dzP * dzP < 36) continue; // 6-unit radius exclusion

        const scale = 0.6 + random() * 1.0;
        const variant = Math.floor(random() * 5);

        items.push({
            type: "tree",
            pos: [x, 0, z],
            scale,
            variant,
        });
    }

    // Rocks
    for (let i = 0; i < 300; i++) {
        const x = (random() - 0.5) * 440;
        const z = (random() - 0.5) * 440;

        if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;

        // Keep portal area clear
        const dxP = x - (-10);
        const dzP = z - (-44.9);
        if (dxP * dxP + dzP * dzP < 36) continue;

        const scale = 0.5 + random() * 1.2;

        items.push({
            type: "rock",
            pos: [x, scale * 0.15, z],
            scale,
        });
    }

    return items;
}

export const ENV_PROPS = generateEnvironment();
