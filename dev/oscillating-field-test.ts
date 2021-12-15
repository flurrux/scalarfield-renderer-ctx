import { Vector2 } from "../lib/types";
import { center, ScalarField } from "../src/grid-field";
import { setupHeightMapScene } from "../src/heightmap-scene";
import { startLoop } from "../src/util";

function createScalarField(amplitude: number) {
	return (p: Vector2) => Math.sin(Math.PI * p[0]) * Math.cos(Math.PI * p[1]) * amplitude;
}

// const scalarField: ScalarField = (p: Vector2) => p[0] * p[1];
// const scalarField: ScalarField = (p: Vector2) => Math.sin(Math.PI * p[0]) * Math.cos(Math.PI * p[1]) * 0.4;
// const scalarField: ScalarField = (p: Vector2) => (Math.cos(7 * magnitude(p)) + 1) * 0.3;

const gridField = center({ position: [0, 0], cellSize: 0.1, size: [20, 20] });

const scene = setupHeightMapScene({
	gridField, heightMap: createScalarField(0.4),
	shape: "triangle"
});

startLoop(
	({ t }) => {
		scene.updateHeightMap(
			createScalarField(Math.cos(t) * 0.4)
		)
	}
);