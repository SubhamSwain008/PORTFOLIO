"use client";

import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

interface InstancedGrassProps {
    realm: "night" | "day";
    baseColor: string;
    count: number;
    treePositions?: [number, number, number][]; // Array of [x,y,z] tree positions
}

// Pseudo-random deterministic generator
function prng(seed: number) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

const BLADES_PER_TREE = 35;

export default function InstancedGrass({ realm, baseColor, count, treePositions = [] }: InstancedGrassProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);

    const seedOffset = realm === "day" ? 1000 : 0;
    const treeGrassCount = treePositions.length * BLADES_PER_TREE;
    const totalCount = count + treeGrassCount;

    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
        vertexColors: true,
        side: THREE.DoubleSide,
    }), [baseColor]);

    // Create a detailed cross-blade geometry: two planes at 90° forming an X
    const geometry = useMemo(() => {
        const segsX = 1;
        const segsY = 5;
        const width = 0.25;
        const height = 0.9;

        const plane1 = new THREE.PlaneGeometry(width, height, segsX, segsY);
        const plane2 = new THREE.PlaneGeometry(width, height, segsX, segsY);
        plane2.rotateY(Math.PI / 2);

        const merged = new THREE.BufferGeometry();
        const p1Pos = plane1.attributes.position;
        const p2Pos = plane2.attributes.position;
        const totalVerts = p1Pos.count + p2Pos.count;
        const positions = new Float32Array(totalVerts * 3);

        for (let i = 0; i < p1Pos.count; i++) {
            positions[i * 3] = p1Pos.getX(i);
            positions[i * 3 + 1] = p1Pos.getY(i);
            positions[i * 3 + 2] = p1Pos.getZ(i);
        }
        for (let i = 0; i < p2Pos.count; i++) {
            const idx = p1Pos.count + i;
            positions[idx * 3] = p2Pos.getX(i);
            positions[idx * 3 + 1] = p2Pos.getY(i);
            positions[idx * 3 + 2] = p2Pos.getZ(i);
        }

        const idx1 = plane1.index!;
        const idx2 = plane2.index!;
        const indices = new Uint16Array(idx1.count + idx2.count);
        for (let i = 0; i < idx1.count; i++) indices[i] = idx1.getX(i);
        for (let i = 0; i < idx2.count; i++) indices[idx1.count + i] = idx2.getX(i) + p1Pos.count;

        merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        merged.setIndex(new THREE.BufferAttribute(indices, 1));
        merged.translate(0, height / 2, 0);

        const pos = merged.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const t = y / height;
            const taper = 1.0 - t * t * 0.9;
            pos.setX(i, pos.getX(i) * taper);
            pos.setZ(i, pos.getZ(i) * taper);
            pos.setZ(i, pos.getZ(i) + t * t * 0.08);
        }

        pos.needsUpdate = true;
        merged.computeVertexNormals();
        plane1.dispose();
        plane2.dispose();
        return merged;
    }, []);

    useEffect(() => {
        if (!meshRef.current) return;

        const colorArr = new Float32Array(totalCount * 3);
        const baseC = new THREE.Color(baseColor);

        // ─── PART 1: Random cluster grass (first `count` instances) ───
        const numClusters = 80;

        for (let i = 0; i < count; i++) {
            const seed = i + seedOffset;

            const clusterIndex = i % numClusters;
            const clusterSeed = clusterIndex * 1337 + seedOffset;

            const cx = (prng(clusterSeed) - 0.5) * 300;
            const cz = (prng(clusterSeed + 100000) - 0.5) * 300;

            const r = Math.pow(prng(seed + 800000), 1.8) * 5.0;
            const a = prng(seed + 900000) * Math.PI * 2;

            const px = cx + Math.cos(a) * r;
            const pz = cz + Math.sin(a) * r;

            if (px * px + pz * pz < 100) {
                tempObject.position.set(0, -1000, 0);
                tempObject.scale.set(0, 0, 0);
                tempObject.updateMatrix();
                meshRef.current.setMatrixAt(i, tempObject.matrix);
                tempColor.setRGB(0, 0, 0);
                tempColor.toArray(colorArr, i * 3);
                continue;
            }

            const rotY = prng(seed + 200000) * Math.PI * 2;
            const scaleY = 0.6 + prng(seed + 300000) * 1.0;
            const scaleX = 0.5 + prng(seed + 400000) * 0.8;

            tempObject.position.set(px, 0, pz);
            tempObject.rotation.set(0, rotY, 0);
            tempObject.scale.set(scaleX, scaleY, 1);
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);

            tempColor.copy(baseC).offsetHSL(
                (prng(seed + 500000) - 0.5) * 0.06,
                (prng(seed + 600000) - 0.5) * 0.1,
                (prng(seed + 700000) - 0.5) * 0.06
            );
            tempColor.toArray(colorArr, i * 3);
        }

        // ─── PART 2: Grass around tree trunks ───
        for (let t = 0; t < treePositions.length; t++) {
            const [tx, , tz] = treePositions[t];

            for (let b = 0; b < BLADES_PER_TREE; b++) {
                const idx = count + t * BLADES_PER_TREE + b;
                const seed = idx + seedOffset + 2000000;

                // Scatter in a ring around the trunk (0.5 to 3.0 units away)
                const dist = 0.5 + prng(seed) * 2.5;
                const angle = prng(seed + 100000) * Math.PI * 2;

                const px = tx + Math.cos(angle) * dist;
                const pz = tz + Math.sin(angle) * dist;

                const rotY = prng(seed + 200000) * Math.PI * 2;
                const scaleY = 0.5 + prng(seed + 300000) * 0.9;
                const scaleX = 0.5 + prng(seed + 400000) * 0.7;

                tempObject.position.set(px, 0, pz);
                tempObject.rotation.set(0, rotY, 0);
                tempObject.scale.set(scaleX, scaleY, 1);
                tempObject.updateMatrix();
                meshRef.current.setMatrixAt(idx, tempObject.matrix);

                // Slightly darker color for under-tree grass (shaded)
                tempColor.copy(baseC).offsetHSL(
                    (prng(seed + 500000) - 0.5) * 0.04,
                    (prng(seed + 600000) - 0.5) * 0.08,
                    -0.03 + (prng(seed + 700000) - 0.5) * 0.04
                );
                tempColor.toArray(colorArr, idx * 3);
            }
        }

        meshRef.current.geometry.setAttribute(
            "color",
            new THREE.InstancedBufferAttribute(colorArr, 3)
        );
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [realm, count, totalCount, seedOffset, baseColor, treePositions]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, totalCount]}
            frustumCulled={false}
            receiveShadow
        />
    );
}
