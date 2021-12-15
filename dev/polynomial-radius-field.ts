import { flow } from "fp-ts/lib/function";
import { Vector2 } from "../lib/types";
import { magnitude, subtract } from "../lib/vec2";
import { center } from "../src/grid-field";
import { setupHeightMapScene } from "../src/heightmap-scene";

type ComplexNumber = Vector2;
function multiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
	return [
		a[0] * b[0] - a[1] * b[1],
		a[0] * b[1] + a[1] * b[0]
	];
}
const evaluatePolynomialByRoots = (roots: ComplexNumber[]) => (x: ComplexNumber): ComplexNumber => {
	let result: ComplexNumber = [1, 0];
	for (const root of roots){
		result = multiply(result, subtract(root, x));
	}
	return result;
}

const roots: ComplexNumber[] = [
	[+0.8, 0],
	[-0.8, 0],
	[0, 0.6]
];

const heightMap = flow(
	evaluatePolynomialByRoots(roots),
	magnitude,
	n => -1 * n + 2
);

const gridField = center({ position: [0, 0], cellSize: 0.1, size: [30, 30] });

const scene = setupHeightMapScene({
	gridField, heightMap,
	shape: "triangle"
});