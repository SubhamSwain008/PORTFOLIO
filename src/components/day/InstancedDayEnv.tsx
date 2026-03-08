import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { EnvItem } from "../../lib/environment";
import { FENCE } from "../settings/settings";

const tempObject = new THREE.Object3D();
const color = new THREE.Color();

// ─── Procedural bark texture (canvas-based, warm daylight variant) ───
function createDayBarkTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Warm brownish base
    ctx.fillStyle = "#5a3d24";
    ctx.fillRect(0, 0, size, size);

    // Vertical bark grooves
    for (let i = 0; i < 55; i++) {
        const x = Math.random() * size;
        const w = 1 + Math.random() * 3;
        const h = 20 + Math.random() * 80;
        const y = Math.random() * size;
        ctx.fillStyle = `rgba(${35 + Math.random() * 30}, ${20 + Math.random() * 18}, ${8 + Math.random() * 12}, ${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(x, y, w, h);
    }

    // Horizontal cracks
    for (let i = 0; i < 20; i++) {
        const y = Math.random() * size;
        const x = Math.random() * size * 0.5;
        const w = 10 + Math.random() * 40;
        ctx.fillStyle = `rgba(25, 14, 6, ${0.2 + Math.random() * 0.2})`;
        ctx.fillRect(x, y, w, 1 + Math.random() * 2);
    }

    // Knots
    for (let i = 0; i < 5; i++) {
        const cx = Math.random() * size;
        const cy = Math.random() * size;
        const r = 3 + Math.random() * 7;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 18, 6, ${0.35 + Math.random() * 0.3})`;
        ctx.fill();
    }

    // Green moss patches (more visible in daylight)
    for (let i = 0; i < 12; i++) {
        const cx = Math.random() * size;
        const cy = Math.random() * size;
        ctx.fillStyle = `rgba(${50 + Math.random() * 30}, ${60 + Math.random() * 30}, ${25 + Math.random() * 20}, ${0.08 + Math.random() * 0.1})`;
        ctx.fillRect(cx, cy, 3 + Math.random() * 10, 3 + Math.random() * 6);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    return tex;
}

function createDayBarkNormalMap(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const w = 1 + Math.random() * 3;
        const h = 30 + Math.random() * 100;
        const y = Math.random() * size;
        ctx.fillStyle = `rgba(100, 128, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(x, y, w / 2, h);
        ctx.fillStyle = `rgba(155, 128, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(x + w / 2, y, w / 2, h);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    return tex;
}

export function InstancedDayTrees({ items }: { items: EnvItem[] }) {
    const configs = [
        { baseColor: "#2a6a30", shape: "sphere", height: 2.2, radius: 1.4 },
        { baseColor: "#256b2d", shape: "cone", height: 3.0, radius: 1.2 },
        { baseColor: "#5a7a2a", shape: "sphere", height: 2.0, radius: 1.6 },
        { baseColor: "#3a7a40", shape: "sphere", height: 2.6, radius: 1.1 },
        { baseColor: "#4a8a35", shape: "cone", height: 2.4, radius: 1.4 },
    ];

    const leafTex = useTexture("/assets/leaf.png");
    leafTex.wrapS = THREE.RepeatWrapping;
    leafTex.wrapT = THREE.RepeatWrapping;
    leafTex.repeat.set(4, 4);
    leafTex.magFilter = THREE.NearestFilter;
    leafTex.minFilter = THREE.NearestFilter;

    const trees = useMemo(() => items.filter((item) => item.type === "tree"), [items]);

    const trunkRef = useRef<THREE.InstancedMesh>(null);
    // Branch refs
    const branch1Ref = useRef<THREE.InstancedMesh>(null);
    const branch2Ref = useRef<THREE.InstancedMesh>(null);
    const branch3Ref = useRef<THREE.InstancedMesh>(null);

    const sphereCanopyRef = useRef<THREE.InstancedMesh>(null);
    const sphereExtra1Ref = useRef<THREE.InstancedMesh>(null);
    const sphereExtra2Ref = useRef<THREE.InstancedMesh>(null);
    const sphereExtra3Ref = useRef<THREE.InstancedMesh>(null);
    const coneCanopyRef = useRef<THREE.InstancedMesh>(null);
    const coneExtraRef = useRef<THREE.InstancedMesh>(null);

    const sphereTrees = useMemo(() => trees.filter(t => configs[(t.variant || 0) % configs.length].shape === "sphere"), [trees, configs]);
    const coneTrees = useMemo(() => trees.filter(t => configs[(t.variant || 0) % configs.length].shape === "cone"), [trees, configs]);

    useEffect(() => {
        if (!trunkRef.current) return;

        // Trunks — thicker, tapered, slight lean
        trees.forEach((tree, i) => {
            const conf = configs[(tree.variant || 0) % configs.length];
            const scale = tree.scale || 1;
            const variant = tree.variant || 0;

            const leanX = ((variant * 17 + i * 7) % 100 - 50) * 0.003;
            const leanZ = ((variant * 23 + i * 13) % 100 - 50) * 0.003;

            tempObject.position.set(tree.pos[0], tree.pos[1] + (conf.height / 2) * scale, tree.pos[2]);
            tempObject.rotation.set(leanX, 0, leanZ);
            tempObject.scale.set(scale, conf.height * scale, scale);
            tempObject.updateMatrix();
            trunkRef.current!.setMatrixAt(i, tempObject.matrix);
        });
        trunkRef.current.instanceMatrix.needsUpdate = true;

        // Branches — 3 per tree, extending visibly outward from trunk
        if (branch1Ref.current && branch2Ref.current && branch3Ref.current) {
            trees.forEach((tree, i) => {
                const conf = configs[(tree.variant || 0) % configs.length];
                const scale = tree.scale || 1;
                const variant = tree.variant || 0;

                const tx = tree.pos[0];
                const ty = tree.pos[1];
                const tz = tree.pos[2];

                // Branch 1 — lower, longest, extends well past trunk
                const angle1 = ((variant * 37 + i * 11) % 628) / 100;
                const tilt1 = 1.15; // ~66° from vertical
                const len1 = 2.2 * scale;
                const h1 = conf.height * 0.5 * scale;
                const d1x = -Math.sin(tilt1) * Math.cos(angle1);
                const d1y = Math.cos(tilt1);
                const d1z = Math.sin(tilt1) * Math.sin(angle1);
                tempObject.position.set(
                    tx + (len1 / 2) * d1x,
                    ty + h1 + (len1 / 2) * d1y,
                    tz + (len1 / 2) * d1z
                );
                tempObject.rotation.order = 'YZX';
                tempObject.rotation.set(0, angle1, tilt1);
                tempObject.scale.set(scale, len1, scale);
                tempObject.updateMatrix();
                branch1Ref.current!.setMatrixAt(i, tempObject.matrix);

                // Branch 2 — mid-height, opposite side
                const angle2 = angle1 + 2.4 + (variant % 3) * 0.4;
                const tilt2 = 1.0; // ~57° from vertical
                const len2 = 1.7 * scale;
                const h2 = conf.height * 0.68 * scale;
                const d2x = -Math.sin(tilt2) * Math.cos(angle2);
                const d2y = Math.cos(tilt2);
                const d2z = Math.sin(tilt2) * Math.sin(angle2);
                tempObject.position.set(
                    tx + (len2 / 2) * d2x,
                    ty + h2 + (len2 / 2) * d2y,
                    tz + (len2 / 2) * d2z
                );
                tempObject.rotation.order = 'YZX';
                tempObject.rotation.set(0, angle2, tilt2);
                tempObject.scale.set(scale * 0.8, len2, scale * 0.8);
                tempObject.updateMatrix();
                branch2Ref.current!.setMatrixAt(i, tempObject.matrix);

                // Branch 3 — upper, shorter, steeper
                const angle3 = angle1 + 4.2 + (variant % 5) * 0.3;
                const tilt3 = 0.85; // ~49° from vertical
                const len3 = 1.3 * scale;
                const h3 = conf.height * 0.82 * scale;
                const d3x = -Math.sin(tilt3) * Math.cos(angle3);
                const d3y = Math.cos(tilt3);
                const d3z = Math.sin(tilt3) * Math.sin(angle3);
                tempObject.position.set(
                    tx + (len3 / 2) * d3x,
                    ty + h3 + (len3 / 2) * d3y,
                    tz + (len3 / 2) * d3z
                );
                tempObject.rotation.order = 'YZX';
                tempObject.rotation.set(0, angle3, tilt3);
                tempObject.scale.set(scale * 0.6, len3, scale * 0.6);
                tempObject.updateMatrix();
                branch3Ref.current!.setMatrixAt(i, tempObject.matrix);
            });

            branch1Ref.current.instanceMatrix.needsUpdate = true;
            branch2Ref.current.instanceMatrix.needsUpdate = true;
            branch3Ref.current.instanceMatrix.needsUpdate = true;
        }

        // Sphere Canopies
        if (sphereCanopyRef.current && sphereTrees.length > 0) {
            const Float32ArrayColor = new Float32Array(sphereTrees.length * 3);

            sphereTrees.forEach((tree, i) => {
                const variant = tree.variant || 0;
                const conf = configs[variant % configs.length];
                const scale = tree.scale || 1;

                tempObject.position.set(tree.pos[0], tree.pos[1] + (conf.height + conf.radius / 1.6) * scale, tree.pos[2]);
                tempObject.rotation.set(0, 0, 0);
                tempObject.scale.set(conf.radius * scale, conf.radius * scale * 0.85, conf.radius * scale);
                tempObject.updateMatrix();
                sphereCanopyRef.current!.setMatrixAt(i, tempObject.matrix);

                color.set(conf.baseColor).offsetHSL((variant % 3) * 0.02, 0.05, (variant % 2) * 0.04);
                color.toArray(Float32ArrayColor, i * 3);

                tempObject.position.set(tree.pos[0] + 0.5 * scale, tree.pos[1] + (conf.height + conf.radius * 0.8) * scale, tree.pos[2] + 0.3 * scale);
                tempObject.scale.set(conf.radius * 0.6 * scale, conf.radius * 0.55 * scale, conf.radius * 0.6 * scale);
                tempObject.updateMatrix();
                sphereExtra1Ref.current!.setMatrixAt(i, tempObject.matrix);

                tempObject.position.set(tree.pos[0] - 0.45 * scale, tree.pos[1] + (conf.height + conf.radius * 0.7) * scale, tree.pos[2] - 0.35 * scale);
                tempObject.scale.set(conf.radius * 0.5 * scale, conf.radius * 0.45 * scale, conf.radius * 0.5 * scale);
                tempObject.updateMatrix();
                sphereExtra2Ref.current!.setMatrixAt(i, tempObject.matrix);

                tempObject.position.set(tree.pos[0] + 0.1 * scale, tree.pos[1] + (conf.height + conf.radius * 1.15) * scale, tree.pos[2] - 0.4 * scale);
                tempObject.scale.set(conf.radius * 0.4 * scale, conf.radius * 0.38 * scale, conf.radius * 0.4 * scale);
                tempObject.updateMatrix();
                sphereExtra3Ref.current!.setMatrixAt(i, tempObject.matrix);
            });

            const instanceColor = new THREE.InstancedBufferAttribute(Float32ArrayColor, 3);
            sphereCanopyRef.current.geometry.setAttribute('color', instanceColor);
            sphereExtra1Ref.current!.geometry.setAttribute('color', instanceColor);
            sphereExtra2Ref.current!.geometry.setAttribute('color', instanceColor);
            sphereExtra3Ref.current!.geometry.setAttribute('color', instanceColor);

            sphereCanopyRef.current.instanceMatrix.needsUpdate = true;
            sphereExtra1Ref.current!.instanceMatrix.needsUpdate = true;
            sphereExtra2Ref.current!.instanceMatrix.needsUpdate = true;
            sphereExtra3Ref.current!.instanceMatrix.needsUpdate = true;
        }

        // Cone Canopies
        if (coneCanopyRef.current && coneTrees.length > 0) {
            const Float32ArrayColor = new Float32Array(coneTrees.length * 3);

            coneTrees.forEach((tree, i) => {
                const variant = tree.variant || 0;
                const conf = configs[variant % configs.length];
                const scale = tree.scale || 1;

                tempObject.position.set(tree.pos[0], tree.pos[1] + (conf.height + conf.radius) * scale, tree.pos[2]);
                tempObject.rotation.set(0, 0, 0);
                tempObject.scale.set(conf.radius * scale, conf.radius * scale, conf.radius * scale);
                tempObject.updateMatrix();
                coneCanopyRef.current!.setMatrixAt(i, tempObject.matrix);

                color.set(conf.baseColor).offsetHSL((variant % 3) * 0.02, 0.05, (variant % 2) * 0.04);
                color.toArray(Float32ArrayColor, i * 3);

                tempObject.position.set(tree.pos[0], tree.pos[1] + (conf.height + conf.radius * 0.5) * scale, tree.pos[2]);
                tempObject.scale.set(conf.radius * 0.85 * scale, conf.radius * 0.7 * scale, conf.radius * 0.85 * scale);
                tempObject.updateMatrix();
                coneExtraRef.current!.setMatrixAt(i, tempObject.matrix);
            });

            const instanceColor = new THREE.InstancedBufferAttribute(Float32ArrayColor, 3);
            coneCanopyRef.current.geometry.setAttribute('color', instanceColor);
            coneExtraRef.current!.geometry.setAttribute('color', instanceColor);

            coneCanopyRef.current.instanceMatrix.needsUpdate = true;
            coneExtraRef.current!.instanceMatrix.needsUpdate = true;
        }

    }, [trees, sphereTrees, coneTrees, configs]);

    // ─── Materials ───
    const barkTex = useMemo(() => createDayBarkTexture(), []);
    const barkNormal = useMemo(() => createDayBarkNormalMap(), []);

    const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: barkTex,
        normalMap: barkNormal,
        normalScale: new THREE.Vector2(0.6, 0.6),
        color: "#694825",
        roughness: 0.88,
        metalness: 0.02,
        flatShading: false,
    }), [barkTex, barkNormal]);

    const branchMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: barkTex,
        normalMap: barkNormal,
        normalScale: new THREE.Vector2(0.4, 0.4),
        color: "#684116",
        roughness: 0.85,
        metalness: 0.02,
        flatShading: false,
    }), [barkTex, barkNormal]);

    const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: leafTex, roughness: 0.75, metalness: 0.02, flatShading: true, vertexColors: true }), [leafTex]);

    return (
        <group>
            {/* TRUNKS — thick brown, 8-sided, tapered */}
            <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow>
                <cylinderGeometry args={[0.14, 0.32, 1, 8]} />
                <primitive object={trunkMaterial} attach="material" />
            </instancedMesh>

            {/* BRANCHES — extending outward from trunk */}
            <instancedMesh ref={branch1Ref} args={[undefined, undefined, trees.length]} castShadow>
                <cylinderGeometry args={[0.025, 0.08, 1, 5]} />
                <primitive object={branchMaterial} attach="material" />
            </instancedMesh>
            <instancedMesh ref={branch2Ref} args={[undefined, undefined, trees.length]} castShadow>
                <cylinderGeometry args={[0.02, 0.065, 1, 5]} />
                <primitive object={branchMaterial} attach="material" />
            </instancedMesh>
            <instancedMesh ref={branch3Ref} args={[undefined, undefined, trees.length]} castShadow>
                <cylinderGeometry args={[0.015, 0.05, 1, 4]} />
                <primitive object={branchMaterial} attach="material" />
            </instancedMesh>

            {/* SPHERE CANOPIES */}
            {sphereTrees.length > 0 && (
                <group>
                    <instancedMesh ref={sphereCanopyRef} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 2]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={sphereExtra1Ref} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 1]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={sphereExtra2Ref} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 1]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={sphereExtra3Ref} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 1]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                </group>
            )}

            {/* CONE CANOPIES */}
            {coneTrees.length > 0 && (
                <group>
                    <instancedMesh ref={coneCanopyRef} args={[undefined, undefined, coneTrees.length]} castShadow>
                        <coneGeometry args={[1, 2.4, 7]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={coneExtraRef} args={[undefined, undefined, coneTrees.length]} castShadow>
                        <coneGeometry args={[1, 1.6, 7]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                </group>
            )}
        </group>
    );
}

export function InstancedDayRocks({ items }: { items: EnvItem[] }) {
    const rocks = useMemo(() => items.filter((item) => item.type === "rock"), [items]);
    const rockRef = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
        if (!rockRef.current) return;

        rocks.forEach((rock, i) => {
            const scale = rock.scale || 1;
            tempObject.position.set(rock.pos[0], rock.pos[1], rock.pos[2]);
            tempObject.rotation.set(0, 0, 0);
            tempObject.scale.set(scale, scale, scale);
            tempObject.updateMatrix();
            rockRef.current!.setMatrixAt(i, tempObject.matrix);
        });

        rockRef.current.instanceMatrix.needsUpdate = true;
    }, [rocks]);

    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#333333",
        roughness: 0.85,
        metalness: 0.2,
        flatShading: true
    }), []);

    return (
        <instancedMesh ref={rockRef} args={[undefined, undefined, rocks.length]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.4, 0]} />
            <primitive object={material} attach="material" />
        </instancedMesh>
    );
}

export function InstancedDayFencePerimeter() {
    const halfSize = FENCE.HALF_SIZE;
    const segmentWidth = FENCE.SEGMENT_WIDTH;
    const segments = Math.ceil((halfSize * 2) / segmentWidth);
    const gateHalfWidth = FENCE.GATE_HALF_WIDTH;

    const picketCountPerSegment = FENCE.PICKETS_PER_SEGMENT;
    const spacing = segmentWidth / picketCountPerSegment;

    const isGateSegment = (pos: number) => Math.abs(pos) < gateHalfWidth;

    // Count actual segments (excluding gates)
    let actualSegments = 0;
    for (let i = 0; i < segments; i++) {
        const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
        if (!isGateSegment(pos)) actualSegments++; // N
        if (!isGateSegment(pos)) actualSegments++; // S
        if (!isGateSegment(pos)) actualSegments++; // W
        if (!isGateSegment(pos)) actualSegments++; // E
    }

    const railsRef = useRef<THREE.InstancedMesh>(null);
    const picketsRef = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
        if (!railsRef.current || !picketsRef.current) return;

        let railIndex = 0;
        let picketIndex = 0;

        const addSegment = (x: number, y: number, z: number, rotationY: number) => {
            const euler = new THREE.Euler(0, rotationY, 0);

            // Top Rail
            tempObject.position.set(0, FENCE.RAIL_TOP_Y, 0).applyEuler(euler).add(new THREE.Vector3(x, y, z));
            tempObject.rotation.set(0, rotationY, 0);
            tempObject.scale.set(1, 1, 1);
            tempObject.updateMatrix();
            railsRef.current!.setMatrixAt(railIndex++, tempObject.matrix);

            // Bottom Rail
            tempObject.position.set(0, FENCE.RAIL_BOTTOM_Y, 0).applyEuler(euler).add(new THREE.Vector3(x, y, z));
            tempObject.rotation.set(0, rotationY, 0);
            tempObject.scale.set(1, 1, 1);
            tempObject.updateMatrix();
            railsRef.current!.setMatrixAt(railIndex++, tempObject.matrix);

            // Pickets
            for (let i = 0; i < picketCountPerSegment; i++) {
                const px = -segmentWidth / 2 + spacing / 2 + i * spacing;
                const height = FENCE.PICKET_BASE_HEIGHT + (i % 3 === 0 ? FENCE.PICKET_HEIGHT_VARIATION : 0);

                tempObject.position.set(px, height / 2, 0).applyEuler(euler).add(new THREE.Vector3(x, y, z));
                tempObject.rotation.set(0, rotationY, 0);
                tempObject.scale.set(1, height, 1);
                tempObject.updateMatrix();
                picketsRef.current!.setMatrixAt(picketIndex++, tempObject.matrix);
            }
        };

        // North — skip gate at center
        for (let i = 0; i < segments; i++) {
            const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
            if (isGateSegment(pos)) continue;
            addSegment(pos, 0, -halfSize, 0);
        }
        // South — skip gate at center
        for (let i = 0; i < segments; i++) {
            const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
            if (isGateSegment(pos)) continue;
            addSegment(pos, 0, halfSize, 0);
        }
        // West — skip gate at center
        for (let i = 0; i < segments; i++) {
            const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
            if (isGateSegment(pos)) continue;
            addSegment(-halfSize, 0, pos, Math.PI / 2);
        }
        // East — skip gate at center
        for (let i = 0; i < segments; i++) {
            const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
            if (isGateSegment(pos)) continue;
            addSegment(halfSize, 0, pos, Math.PI / 2);
        }

        railsRef.current.instanceMatrix.needsUpdate = true;
        picketsRef.current.instanceMatrix.needsUpdate = true;
    }, [segments, actualSegments]);

    const railMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: FENCE.DAY_RAIL_COLOR, roughness: 0.8, metalness: 0.02 }), []);
    const picketMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: FENCE.DAY_PICKET_COLOR, roughness: 0.82, metalness: 0.02 }), []);

    return (
        <group>
            {/* Rails: 2 per segment */}
            <instancedMesh ref={railsRef} args={[undefined, undefined, actualSegments * 2]} castShadow>
                <boxGeometry args={[segmentWidth, 0.06, 0.04]} />
                <primitive object={railMaterial} attach="material" />
            </instancedMesh>

            {/* Pickets */}
            <instancedMesh ref={picketsRef} args={[undefined, undefined, actualSegments * picketCountPerSegment]} castShadow>
                <boxGeometry args={[0.08, 1, 0.03]} />
                <primitive object={picketMaterial} attach="material" />
            </instancedMesh>
        </group>
    );
}
