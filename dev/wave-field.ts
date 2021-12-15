import { Vector2 } from "../lib/types";
import { distance, magnitude } from "../lib/vec2";
import { center } from "../src/grid-field";
import { setupHeightMapScene } from "../src/heightmap-scene";

function heightMap(p: Vector2): number {
	// const f = 2;
	// return Math.sin(x * f) * Math.sin(y * f) * 0.2;
	return -1 * magnitude(p)**2;
}
const gridField = center({ position: [0, 0], cellSize: 0.1, size: [30, 30] });

setupHeightMapScene({
	gridField, heightMap,
	shape: "triangle"
});