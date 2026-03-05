import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { EnvItem } from "../lib/environment";

const tempObject = new THREE.Object3D();
const color = new THREE.Color();

export function InstancedTrees({ items }: { items: EnvItem[] }) {
    const configs = [
        { baseColor: "#1a2a20", shape: "sphere", height: 2.0, radius: 1.2 },
        { baseColor: "#15241d", shape: "cone", height: 2.8, radius: 1.1 },
        { baseColor: "#362217", shape: "sphere", height: 1.8, radius: 1.4 },
        { baseColor: "#232e2a", shape: "sphere", height: 2.4, radius: 1.0 },
        { baseColor: "#272e1c", shape: "cone", height: 2.2, radius: 1.3 },
    ];

    const leafTex = useTexture("/assets/leaf.png");
    leafTex.wrapS = THREE.RepeatWrapping;
    leafTex.wrapT = THREE.RepeatWrapping;
    leafTex.repeat.set(2, 2);
    leafTex.magFilter = THREE.NearestFilter;
    leafTex.minFilter = THREE.NearestFilter;

    const trees = useMemo(() => items.filter((item) => item.type === "tree"), [items]);

    const trunkRef = useRef<THREE.InstancedMesh>(null);
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

        // Trunks — geometry height is 1, so scale Y by conf.height * scale
        trees.forEach((tree, i) => {
            const conf = configs[(tree.variant || 0) % configs.length];
            const scale = tree.scale || 1;

            // Trunk center Y = (conf.height / 2) * scale  → bottom at Y=0
            tempObject.position.set(tree.pos[0], tree.pos[1] + (conf.height / 2) * scale, tree.pos[2]);
            tempObject.rotation.set(0, 0, 0);
            tempObject.scale.set(scale, conf.height * scale, scale);
            tempObject.updateMatrix();
            trunkRef.current!.setMatrixAt(i, tempObject.matrix);
        });
        trunkRef.current.instanceMatrix.needsUpdate = true;

        // Sphere Canopies
        if (sphereCanopyRef.current && sphereTrees.length > 0) {
            const Float32ArrayColor = new Float32Array(sphereTrees.length * 3);

            sphereTrees.forEach((tree, i) => {
                const variant = tree.variant || 0;
                const conf = configs[variant % configs.length];
                const scale = tree.scale || 1;

                tempObject.position.set(tree.pos[0], tree.pos[1] + (conf.height + conf.radius / 1.6) * scale, tree.pos[2]);
                tempObject.rotation.set(0, 0, 0);
                tempObject.scale.set(conf.radius * scale, conf.radius * scale, conf.radius * scale);
                tempObject.updateMatrix();
                sphereCanopyRef.current!.setMatrixAt(i, tempObject.matrix);

                color.set(conf.baseColor).offsetHSL((variant % 3) * 0.01, 0, (variant % 2) * 0.03);
                color.toArray(Float32ArrayColor, i * 3);

                // Extra 1
                tempObject.position.set(tree.pos[0] + 0.4 * scale, tree.pos[1] + (conf.height + conf.radius * 0.9) * scale, tree.pos[2] + 0.2 * scale);
                tempObject.scale.set(conf.radius * 0.55 * scale, conf.radius * 0.55 * scale, conf.radius * 0.55 * scale);
                tempObject.updateMatrix();
                sphereExtra1Ref.current!.setMatrixAt(i, tempObject.matrix);

                // Extra 2
                tempObject.position.set(tree.pos[0] - 0.35 * scale, tree.pos[1] + (conf.height + conf.radius * 0.8) * scale, tree.pos[2] - 0.25 * scale);
                tempObject.scale.set(conf.radius * 0.45 * scale, conf.radius * 0.45 * scale, conf.radius * 0.45 * scale);
                tempObject.updateMatrix();
                sphereExtra2Ref.current!.setMatrixAt(i, tempObject.matrix);

                // Extra 3
                tempObject.position.set(tree.pos[0] + 0.15 * scale, tree.pos[1] + (conf.height + conf.radius * 1.1) * scale, tree.pos[2] - 0.35 * scale);
                tempObject.scale.set(conf.radius * 0.35 * scale, conf.radius * 0.35 * scale, conf.radius * 0.35 * scale);
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

                color.set(conf.baseColor).offsetHSL((variant % 3) * 0.01, 0, (variant % 2) * 0.03);
                color.toArray(Float32ArrayColor, i * 3);

                // Extra Cone
                tempObject.position.set(tree.pos[0], tree.pos[1] + (conf.height + conf.radius * 0.6) * scale, tree.pos[2]);
                tempObject.scale.set(conf.radius * 0.75 * scale, conf.radius * 0.75 * scale, conf.radius * 0.75 * scale);
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

    const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2d241c", roughness: 0.9, metalness: 0, flatShading: true }), []);
    const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: leafTex, roughness: 0.85, metalness: 0.04, flatShading: true, vertexColors: true }), [leafTex]);

    return (
        <group>
            {/* TRUNKS */}
            <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow>
                <cylinderGeometry args={[0.08, 0.18, 1, 6]} />
                <primitive object={trunkMaterial} attach="material" />
            </instancedMesh>

            {/* SPHERE CANOPIES */}
            {sphereTrees.length > 0 && (
                <group>
                    <instancedMesh ref={sphereCanopyRef} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 1]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={sphereExtra1Ref} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 0]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={sphereExtra2Ref} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 0]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={sphereExtra3Ref} args={[undefined, undefined, sphereTrees.length]} castShadow>
                        <icosahedronGeometry args={[1, 0]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                </group>
            )}

            {/* CONE CANOPIES */}
            {coneTrees.length > 0 && (
                <group>
                    <instancedMesh ref={coneCanopyRef} args={[undefined, undefined, coneTrees.length]} castShadow>
                        <coneGeometry args={[1, 2.1, 6]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                    <instancedMesh ref={coneExtraRef} args={[undefined, undefined, coneTrees.length]} castShadow>
                        <coneGeometry args={[1, 1.4 / 0.75, 6]} />
                        <primitive object={leafMaterial} attach="material" />
                    </instancedMesh>
                </group>
            )}
        </group>
    );
}

export function InstancedRocks({ items }: { items: EnvItem[] }) {
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
        color: "#2b2b2b",
        roughness: 0.9,
        metalness: 0.08,
        flatShading: true
    }), []);

    return (
        <instancedMesh ref={rockRef} args={[undefined, undefined, rocks.length]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.4, 0]} />
            <primitive object={material} attach="material" />
        </instancedMesh>
    );
}

export function InstancedFencePerimeter() {
    const halfSize = 45;
    const segmentWidth = 4;
    const segments = Math.ceil((halfSize * 2) / segmentWidth);
    const gateHalfWidth = 4; // 8-unit wide gate opening on each side

    const picketCountPerSegment = 12;
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
            tempObject.position.set(0, 0.8, 0).applyEuler(euler).add(new THREE.Vector3(x, y, z));
            tempObject.rotation.set(0, rotationY, 0);
            tempObject.scale.set(1, 1, 1);
            tempObject.updateMatrix();
            railsRef.current!.setMatrixAt(railIndex++, tempObject.matrix);

            // Bottom Rail
            tempObject.position.set(0, 0.35, 0).applyEuler(euler).add(new THREE.Vector3(x, y, z));
            tempObject.rotation.set(0, rotationY, 0);
            tempObject.scale.set(1, 1, 1);
            tempObject.updateMatrix();
            railsRef.current!.setMatrixAt(railIndex++, tempObject.matrix);

            // Pickets
            for (let i = 0; i < picketCountPerSegment; i++) {
                const px = -segmentWidth / 2 + spacing / 2 + i * spacing;
                const height = 0.9 + (i % 3 === 0 ? 0.12 : 0);

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
        // South
        for (let i = 0; i < segments; i++) {
            const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
            if (isGateSegment(pos)) continue;
            addSegment(pos, 0, halfSize, 0);
        }
        // West
        for (let i = 0; i < segments; i++) {
            const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
            if (isGateSegment(pos)) continue;
            addSegment(-halfSize, 0, pos, Math.PI / 2);
        }
        // East
        for (let i = 0; i < segments; i++) {
            const pos = -halfSize + segmentWidth / 2 + i * segmentWidth;
            if (isGateSegment(pos)) continue;
            addSegment(halfSize, 0, pos, Math.PI / 2);
        }

        railsRef.current.instanceMatrix.needsUpdate = true;
        picketsRef.current.instanceMatrix.needsUpdate = true;
    }, [segments, actualSegments]);

    const railMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7a7c80", roughness: 0.7, metalness: 0.02 }), []);
    const picketMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6b6d73", roughness: 0.75, metalness: 0.02 }), []);

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
