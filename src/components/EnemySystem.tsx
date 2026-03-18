"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Hellhound,
  ShadowSpider,
  FloatingGhost,
  ShadowWraith,
  SkullSpecter,
} from "./EnemyModels";
import {
  getEnemyState,
  setEnemyState,
  spawnEnemy,
  removeEnemy,
  useEnemyStore,
  ActiveEnemy,
} from "./useEnemyStore";
import { getHealthState, setHealthState } from "./useHealthStore";
import { getGameState, setGameState } from "./useGameStore";
import { setInventoryState } from "./inventory/inventory";
import { ENV_PROPS } from "../lib/environment";
import {
  ENEMIES,
  ENEMY_TYPES,
  EnemyType,
  PLAYER,
  WORLD,
  SHADOW_WRAITH,
  FIRE_TORCH,
} from "./settings/settings";

// ─── Model Lookup ────────────────────────────────────────
const MODEL_COMPONENTS: Record<
  EnemyType,
  React.FC<{ position: [number, number, number] }>
> = {
  hellhound: Hellhound,
  shadow_spider: ShadowSpider,
  floating_ghost: FloatingGhost,
  shadow_wraith: ShadowWraith,
  skull_specter: SkullSpecter,
};

const ENEMY_TYPE_KEYS: EnemyType[] = Object.keys(ENEMY_TYPES) as EnemyType[];

// ─── Generate random spawn points outside the fence ──────
function generateSpawnPoints(): [number, number][] {
  const points: [number, number][] = [];
  const maxAttempts = ENEMIES.SPAWN_POINT_COUNT * 10;
  let attempts = 0;

  while (points.length < ENEMIES.SPAWN_POINT_COUNT && attempts < maxAttempts) {
    attempts++;
    // Random angle and distance from center
    const angle = Math.random() * Math.PI * 2;
    const dist =
      ENEMIES.SPAWN_MIN_DISTANCE +
      Math.random() * (ENEMIES.SPAWN_MAX_DISTANCE - ENEMIES.SPAWN_MIN_DISTANCE);
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    // Ensure outside fence safe zone
    if (
      Math.abs(x) < ENEMIES.FENCE_SAFE_ZONE + 5 &&
      Math.abs(z) < ENEMIES.FENCE_SAFE_ZONE + 5
    ) {
      continue;
    }

    // Ensure minimum separation from existing points
    let tooClose = false;
    for (const p of points) {
      const dx = x - p[0];
      const dz = z - p[1];
      if (dx * dx + dz * dz < ENEMIES.SPAWN_MIN_SEPARATION * ENEMIES.SPAWN_MIN_SEPARATION) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    points.push([x, z]);
  }

  return points;
}

// ─── Unique ID generator ─────────────────────────────────
let enemyCounter = 0;
function makeEnemyId(): string {
  return `enemy_${Date.now()}_${enemyCounter++}`;
}

// ─── Pick random enemy type respecting maxCount ──────────
function pickEnemyType(activeEnemies: ActiveEnemy[]): EnemyType | null {
  // Count active enemies by type
  const counts: Partial<Record<EnemyType, number>> = {};
  for (const e of activeEnemies) {
    counts[e.type] = (counts[e.type] || 0) + 1;
  }

  // Filter types that haven't hit their maxCount
  const available = ENEMY_TYPE_KEYS.filter((type) => {
    const config = ENEMY_TYPES[type];
    return (counts[type] || 0) < config.maxCount;
  });

  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ─── Tree collision data (precomputed) ───────────────────
const TREE_POSITIONS = ENV_PROPS.filter((e) => e.type === "tree").map((e) => ({
  x: e.pos[0],
  z: e.pos[2],
  radius: WORLD.TREE_COLLISION_RADIUS,
}));

interface EnemySystemProps {
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  playerAngleRef: React.MutableRefObject<number>;
}

// ─── Single Enemy Renderer (with animation) ─────────────
function EnemyRenderer({
  enemy,
  playerPos,
}: {
  enemy: ActiveEnemy;
  playerPos: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const ModelComponent = MODEL_COMPONENTS[enemy.type];
  const config = ENEMY_TYPES[enemy.type];

  // Calculate rotation to face the player
  const dx = playerPos.x - enemy.position.x;
  const dz = playerPos.z - enemy.position.z;
  const angle = Math.atan2(dx, dz);

  // Walk bob animation
  const bobY = enemy.isChasing
    ? Math.abs(Math.sin(enemy.animTime * 8)) * 0.08
    : Math.sin(enemy.animTime * 2) * 0.03;

  return (
    <group
      ref={groupRef}
      position={[
        enemy.position.x,
        config.yOffset + bobY,
        enemy.position.z,
      ]}
      rotation={[0, angle, 0]}
      scale={[config.scale, config.scale, config.scale]}
    >
      <ModelComponent position={[0, 0, 0]} />
    </group>
  );
}

// ─── Hit Flash Overlay ───────────────────────────────────
function HitFlashOverlay() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ camera }, delta) => {
    if (!meshRef.current || !matRef.current) return;

    const enemyState = getEnemyState();

    // Position in front of camera
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    meshRef.current.position.copy(camera.position).add(dir.multiplyScalar(0.3));
    meshRef.current.quaternion.copy(camera.quaternion);

    // Fade out
    if (enemyState.hitFlashAlpha > 0) {
      const newAlpha = Math.max(
        0,
        enemyState.hitFlashAlpha - delta / ENEMIES.HIT_FLASH_DURATION
      );
      matRef.current.opacity = newAlpha * 0.35;
      setEnemyState({ hitFlashAlpha: newAlpha });
    } else {
      matRef.current.opacity = 0;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={9998}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial
        ref={matRef}
        color="#ff0000"
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Main Enemy System ───────────────────────────────────
export default function EnemySystem({ playerPosRef, playerAngleRef }: EnemySystemProps) {
  // Generate spawn points once per mount (random each session)
  const spawnPoints = useMemo(() => generateSpawnPoints(), []);

  // Refs for mutable state accessed in useFrame (avoid re-renders)
  const activeEnemiesRef = useRef<ActiveEnemy[]>([]);
  const spawnCooldownsRef = useRef<Record<number, number>>({});

  useFrame((_, delta) => {
    const playerPos = playerPosRef.current;
    if (!playerPos) return;

    const gameState = getGameState();
    if (gameState.isDead || gameState.gameMode !== "explore" || gameState.isPaused) return;

    const now = Date.now();
    let enemies = [...activeEnemiesRef.current];
    let changed = false;

    // ─── Fire Torch State ───
    const torchEquippedAt = gameState.fireTorchEquippedAt;
    const isTorchActive = torchEquippedAt !== null && (now - torchEquippedAt < FIRE_TORCH.BURN_DURATION * 1000);

    // Auto-expire torch check (done once per frame)
    if (torchEquippedAt !== null && !isTorchActive) {
      setTimeout(() => setGameState({ fireTorchEquippedAt: null }), 0);
    }

    // ─── 1. SPAWN LOGIC ───
    // Check if player is inside the fence (safe zone — no spawning)
    const playerInFence =
      Math.abs(playerPos.x) < ENEMIES.FENCE_SAFE_ZONE &&
      Math.abs(playerPos.z) < ENEMIES.FENCE_SAFE_ZONE;

    if (!playerInFence && enemies.length < ENEMIES.MAX_ACTIVE_ENEMIES) {
      for (let i = 0; i < spawnPoints.length; i++) {
        if (enemies.length >= ENEMIES.MAX_ACTIVE_ENEMIES) break;

        const [sx, sz] = spawnPoints[i];
        const dx = playerPos.x - sx;
        const dz = playerPos.z - sz;
        const distSq = dx * dx + dz * dz;

        if (distSq > ENEMIES.ACTIVATION_RADIUS * ENEMIES.ACTIVATION_RADIUS) continue;

        // Check cooldown
        const lastSpawn = spawnCooldownsRef.current[i] || 0;
        if (now - lastSpawn < ENEMIES.SPAWN_COOLDOWN * 1000) continue;

        // Check if there's already an enemy from this spawn point
        if (enemies.some((e) => e.spawnPointIndex === i)) continue;

        // Pick enemy type
        const type = pickEnemyType(enemies);
        if (!type) continue;

        const config = ENEMY_TYPES[type];
        const newEnemy: ActiveEnemy = {
          id: makeEnemyId(),
          type,
          position: new THREE.Vector3(sx, 0, sz),
          hp: config.hp,
          isChasing: false,
          spawnPointIndex: i,
          animTime: 0,
          lastAttackTime: 0,
        };

        enemies.push(newEnemy);
        spawnCooldownsRef.current[i] = now;
        changed = true;
      }
    }

    // ─── 2. UPDATE EACH ENEMY ───
    const toRemove: string[] = [];

    for (const enemy of enemies) {
      const config = ENEMY_TYPES[enemy.type];
      const dx = playerPos.x - enemy.position.x;
      const dz = playerPos.z - enemy.position.z;
      const distSq = dx * dx + dz * dz;
      const dist = Math.sqrt(distSq);

      // Despawn if too far
      if (dist > ENEMIES.DESPAWN_RADIUS) {
        toRemove.push(enemy.id);
        changed = true;
        continue;
      }

      // Always chase when within activation radius
      enemy.isChasing = dist < ENEMIES.ACTIVATION_RADIUS * 1.5;

      // ─── Flashlight freeze (Shadow Wraith) ───
      // Enemies with freezeOnFlashlight skip chase + attack while in flashlight cone
      if (config.freezeOnFlashlight && enemy.isChasing) {
        const playerAngle = playerAngleRef.current;
        const flashDirX = Math.sin(playerAngle);
        const flashDirZ = Math.cos(playerAngle);
        // Direction from player to enemy (normalized)
        const toEnemyX = dx / dist;
        const toEnemyZ = dz / dist;
        // Dot product = cos(angle between flashlight dir and to-enemy dir)
        const dot = flashDirX * toEnemyX + flashDirZ * toEnemyZ;
        const angleBetween = Math.acos(Math.min(1, Math.max(-1, dot)));

        if (angleBetween < SHADOW_WRAITH.FLASHLIGHT_CONE_ANGLE && dist < SHADOW_WRAITH.FLASHLIGHT_MAX_DISTANCE) {
          // Frozen — skip chase and attack entirely
          enemy.isChasing = false;
          enemy.animTime += delta;
          continue;
        }
      }

      // ─── Fire Torch repel check ───
      // Determine effective stop distance
      const effectiveStopDist = isTorchActive ? FIRE_TORCH.REPEL_DISTANCE : ENEMIES.ATTACK_RANGE * 0.5;

      // ─── Chase movement ───
      if (enemy.isChasing && dist > ENEMIES.ATTACK_RANGE * 0.5) {
        // If torch is active and enemy is already within repel distance, push outward smoothly
        if (dist <= effectiveStopDist) {
          if (isTorchActive && dist > 0.05) {
            const pushDist = FIRE_TORCH.REPEL_DISTANCE - dist;
            // Smooth the push so it doesn't snap abruptly
            const smoothing = Math.min(1.0, 10.0 * delta);
            enemy.position.x -= (dx / dist) * pushDist * smoothing;
            enemy.position.z -= (dz / dist) * pushDist * smoothing;
            changed = true;
          }
          enemy.animTime += delta;
          continue;
        }

        const speed = PLAYER.WALK_SPEED * config.speedMultiplier;
        const moveX = (dx / dist) * speed * delta;
        const moveZ = (dz / dist) * speed * delta;

        let nextX = enemy.position.x + moveX;
        let nextZ = enemy.position.z + moveZ;

        // ── Tree collision (slide around) ──
        for (const tree of TREE_POSITIONS) {
          const tdx = nextX - tree.x;
          const tdz = nextZ - tree.z;
          const tDistSq = tdx * tdx + tdz * tdz;
          const minDist = ENEMIES.COLLISION_RADIUS + tree.radius;

          if (tDistSq < minDist * minDist) {
            const tDist = Math.sqrt(tDistSq);
            if (tDist === 0) {
              nextX += minDist;
              continue;
            }
            const overlap = minDist - tDist;
            const nx = tdx / tDist;
            const nz = tdz / tDist;
            nextX += nx * overlap;
            nextZ += nz * overlap;
          }
        }

        // ── Fence safe zone exclusion ──
        // Enemies cannot enter the fence area
        const fenceDist = ENEMIES.FENCE_SAFE_ZONE;
        if (Math.abs(nextX) < fenceDist && Math.abs(nextZ) < fenceDist) {
          // Push back to nearest fence edge
          const penLeft = nextX + fenceDist;
          const penRight = fenceDist - nextX;
          const penBottom = nextZ + fenceDist;
          const penTop = fenceDist - nextZ;
          const minPen = Math.min(penLeft, penRight, penBottom, penTop);

          if (minPen === penLeft) nextX = -fenceDist;
          else if (minPen === penRight) nextX = fenceDist;
          else if (minPen === penBottom) nextZ = -fenceDist;
          else nextZ = fenceDist;
        }

        enemy.position.x = nextX;
        enemy.position.z = nextZ;
        changed = true;
      }

      // ─── Attack logic ───
      if (dist < ENEMIES.ATTACK_RANGE && !isTorchActive) {
        if (now - enemy.lastAttackTime > config.attackCooldown * 1000) {
          enemy.lastAttackTime = now;
          changed = true;

          // Deal damage
          const health = getHealthState().health;
          const newHealth = Math.max(0, health - config.damage);
          setHealthState({ health: newHealth });
          setEnemyState({ hitFlashAlpha: 1 });

          // Death check
          if (newHealth <= 0) {
            setTimeout(() => {
              setGameState({ isDead: true, deathCause: "enemy" });
              setInventoryState({ items: [] });
              fetch("/api/game/save-death", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              }).catch(() => {});
            }, 0);
          }
        }
      }

      // ─── Animate ───
      enemy.animTime += delta;
    }

    // ─── 3. REMOVE DESPAWNED ENEMIES ───
    if (toRemove.length > 0) {
      enemies = enemies.filter((e) => !toRemove.includes(e.id));
      changed = true;
    }

    // ─── 4. COMMIT STATE ───
    const isAnyChasing = enemies.some((e) => e.isChasing);
    const isPlayerChased = isAnyChasing && !playerInFence;

    if (changed || getEnemyState().isPlayerChased !== isPlayerChased) {
      activeEnemiesRef.current = enemies;
      // Only update the store for React rendering (batched)
      setEnemyState({ activeEnemies: enemies, isPlayerChased });
    } else {
      activeEnemiesRef.current = enemies;
    }
  });

  // ─── Render active enemies ─────────────────────────────
  const activeEnemies = useEnemyStore((s) => s.activeEnemies);

  return (
    <group>
      <HitFlashOverlay />
      {activeEnemies.map((enemy) => (
        <EnemyRenderer
          key={enemy.id}
          enemy={enemy}
          playerPos={playerPosRef.current}
        />
      ))}
    </group>
  );
}
