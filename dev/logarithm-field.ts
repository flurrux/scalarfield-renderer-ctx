import { Vector2 } from "../lib/types";
import { distance } from "../lib/vec2";
import { center } from "../src/grid-field";
import { setupHeightMapScene } from "../src/heightmap-scene";

function heightMap(point: Vector2): number {
	const p = 0.1;
	const logInput = distance(point, [p, 0]) / distance(point, [1 / p, 0]);
	return -0.2 * Math.log(logInput);
}
const gridField = center({ position: [0, 0], cellSize: 0.1, size: [30, 30] });

const scene = setupHeightMapScene({
	gridField, heightMap,
	shape: "triangle"
});