# Three.js Portal Scene

An interactive 3D scene featuring a mystical portal with dynamic lighting effects and floating fireflies, built with Three.js.

## Features

- Mystical portal with customizable animated shader effects
- Dynamic fireflies particles with custom shaders
- Baked lighting and textures for optimal performance
- Interactive camera controls with orbital movement
- Fully customizable settings via GUI interface

## Controls & Customization

The scene includes a debug UI with the following customizable parameters:

### Global Settings
- Fireflies Size
- Background Color

### Portal Settings
- Light Color Start
- Light Color End
- Animation Speed
- Noise Scale
- Outer Glow Strength

## Technical Details

- Built with Three.js
- Uses custom GLSL shaders for portal and firefly effects
- Implements DRACO compression for 3D model optimization
- Responsive design with window resize handling
- Optimized rendering with pixel ratio limiting

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run these commands:

```bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

## Project Structure

```
├── src/
│   ├── script.js          # Main application code
│   └── shaders/
│       ├── fireflies/     # Firefly shader files
│       └── portal/        # Portal shader files
├── static/
│   ├── portal.glb         # 3D model
│   ├── baked.jpg         # Baked textures
│   └── draco/            # DRACO decoder
```

## Camera Controls

- Orbit: Left mouse button
- Zoom: Mouse wheel
- Pan: Right mouse button
- Maximum zoom distance: 15 units
- Minimum zoom distance: 1 unit
- Restricted vertical rotation to prevent ground clipping

## Credits

This project was created following Bruno Simon's [Three.js Journey](https://threejs-journey.com/) course, an excellent resource for learning Three.js and WebGL.