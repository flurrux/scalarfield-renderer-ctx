import { Vector2 } from "../lib/types";
import { divide } from "../lib/vec2";
import { center } from "../src/grid-field";
import { setupHeightMapScene } from "../src/heightmap-scene";
import { startLoop } from "../src/util";

function cartesianToPolar(cartesian: Vector2): Vector2 {
	const magnitude = Math.hypot(...cartesian);
	if (magnitude === 0) return [0, 0];
	const normVector = divide(cartesian, magnitude);
	const asinX = Math.asin(normVector[0]);
	let angle = cartesian[1] > 0 ? asinX : (Math.PI - asinX);
	return [angle, magnitude];
}

function heightMap(p: Vector2): number {
	const f = 2;
	return Math.sin(p[0] * f) * Math.sin(p[1] * f) * 0.35;
	// return -1 * magnitude(p)**2;
	
	//return Math.sin(p[0] + p[1]);

	// const [x, y] = p;
	// return 1;
	// return p[0];
	// return (x**2 - y**2) * 0.4;
	
	// const [a, r] = cartesianToPolar(p);
	// const n = 3;
	// return r**n * Math.sin(n * a) * 0.2;
}

// const heightMap = ([x, y]: Vector2): number => {
// 	const t = 2;
// 	const r = Math.hypot(x, y);
// 	return (t**2 - r**2)**(-1/2);
// };

// const heightMap = ([x, y]: Vector2): number => {
// 	const r = Math.hypot(x, y);
// 	return -Math.log(r);
// };

const sceneController = setupHeightMapScene({
	gridField: center({ 
		position: [0, 0], 
		cellSize: 0.1, 
		size: [30, 30]
	}), 
	heightMap,
	// colorField: ([x, y, z]) => Math.hypot(x, z) < 0.4 ? "red" : "white",
	shape: "triangle"
});

let loopRunning = true;
document.addEventListener("keydown", e => {
	if (e.key === " ") loopRunning = !loopRunning;
});
startLoop(
	(args) => {
		if (!loopRunning) return;
		// sceneController.transformCamera(
		// 	(cam) => ({
		// 		...cam,
		// 		orbitParams: {
		// 			...cam.orbitParams,
		// 			longitude: 0.3 * args.t
		// 		}
		// 	})
		// );
		const f = 2;
		sceneController.updateHeightMap(
			([x, y]) => Math.sin(x * f) * Math.sin(y * f) * 0.35 * Math.sin(args.t)
		);
	}
);