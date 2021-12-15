import { Vector2 } from "../lib/types";
import { setupHeightMapScene } from "../src/heightmap-scene";
import { emptyField, evaluateByWorldCoordinate, setValueAt } from '../src/scalar-grid-field';
import { pipe } from "fp-ts/lib/function";

const cellCount = 4;
const cellSize = 1 / 4;
const visibleCellCount = 4;

const scalarGridField = pipe(
	emptyField({
		position: [0, 0],
		size: [cellCount, cellCount],
		cellSize: cellSize
	}),
	setValueAt([0, 0], 1)
);

const gridField = { 
	position: [0, 0] as Vector2, cellSize, 
	size: [visibleCellCount, visibleCellCount] as Vector2 
};

const scene = setupHeightMapScene({
	gridField, 
	heightMap: evaluateByWorldCoordinate(scalarGridField),
	shape: "cube"
});