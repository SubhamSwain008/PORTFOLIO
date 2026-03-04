# 3D Interactive Portfolio

A unique, web-based 3D interactive portfolio built with Next.js, React, Three.js, and React Three Fiber. This project seamlessly blends an outdoor exploration experience with a claustrophobic, horror-themed interior showcase, providing an immersive journey without any page reloads.

## 🌟 Key Features

### 1. Seamless Multi-Environment World
- **The Exterior (World):** A lonely, open-ended 3D environment featuring low-poly leafy trees, rocks, a white picket fence perimeter, and a central Profile Building. Players can explore freely, enjoying an atmospheric, quiet setting.
- **The Interior (Horror Showcase):** Entering the Profile Building transitions the game into a tight, dark, and scary 2D-style environment. Characterized by blood-red lighting, screen shakes, flickering candles, and creeping dread.

### 2. Immersive Horror Elements
The interior is packed with terrifying details to flip the tone entirely:
- **Atmospheric Props:** Floating dust particles, blood drips, cobwebs, and a creepy wall candle sconce.
- **Pixelated Low-Poly Furniture:** Blocky, retro-horror-styled tables, chairs, bookshelves, barrels, and a skull centerpiece.
- **Multi-floor Design:** A staircase connects a ground floor and an upper floor, adding depth to the constrained space.
- **"Death Screen" / Glitching Stats:** A bloody, broken UI overlay imitating a survival horror game with glitching, blood-red stat bars.

### 3. Advanced State Management & Transitions
- **`useGameStore`:** A global singleton store (Zustand-like, using `useSyncExternalStore`) that manages the smooth transition of `GameMode` between "explore" (outside), "transitioning-in", "interior", and "transitioning-out".
- **Diegetic Prompts:** Approaching the building reveals an organic entrance prompt ("E to Enter"), bridging the gap between exploration and action seamlessly.
- **Camera Controller:** Dynamically snaps from an open-world third-person view to a tight, screen-filling orthographic view depending on the player's location.

### 4. Custom Player Controls
- **`Player.tsx`:** Handles character movement and collision physics. Out in the exterior world, it relies on broad exploration movement; inside, the controls switch to match the heavy, confined nature of the horror environment.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router), React 19
- **3D Rendering:** Three.js, React Three Fiber (@react-three/fiber), React Three Drei (@react-three/drei)
- **Styling:** Tailwind CSS V4
- **Language:** TypeScript

## 🎮 Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the portfolio.

## 📂 Project Structure

- `src/components/World.tsx`: Renders the outdoor exploration area, fences, trees, and ground.
- `src/components/InteriorWorld.tsx`: Contains the massive horror-themed interior, complete with pixelated props, particle effects, and multi-floor logic.
- `src/components/Player.tsx` & `CameraController.tsx`: The core logic for player movement and camera framing, adapting smoothly between exterior and interior modes.
- `src/components/useGameStore.ts`: Handles global state, specifically tracking the player's transition progress, current floor, and proximity to interactive objects.

## 🛠️ Modifying the Scene

You can start editing the world by modifying `src/app/page.tsx` or diving straight into the environment components in `src/components/`. 
