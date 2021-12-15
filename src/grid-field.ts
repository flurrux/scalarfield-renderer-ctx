import { map } from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { Vector2 } from "../lib/types";
import * as Vec2 from "../lib/vec2";

function calculateFlatIndex(width: number, coordinate: Vector2): number {
	return coordinate[0] + width * coordinate[1];
}

//the position of the field is where the left-most and back-most cell is, NOT centered!
//so the cell with the smallest x and smallest z coordiante

export type GridField = {
	cellSize: number, 
	size: Vector2,
	position: Vector2
};

// export function getValueAt(field: GridScalarField, coordinate: Vector2): number {
// 	return field[calculateFlatIndex(field.size[0], coordinate)];
// }

export function center<F extends GridField>(field: F): F {
	return {
		...field,
		position: Vec2.multiply(field.size, -field.cellSize / 2)
	}
}

export type ScalarField = (p: Vector2) => number;

function createGridPoints(size: Vector2): Vector2[] {
	let points: Vector2[] = [];
	for (let x = 0; x < size[0]; x++){
		for (let y = 0; y < size[1]; y++){
			points.push([x, y]);
		}
	}
	return points;	
}

export const gridToWorldCoordinate = (gridField: GridField) => (coo: Vector2): Vector2 => {
	return Vec2.add(gridField.position, Vec2.multiply(coo, gridField.cellSize));
};
export const worldToGridCoordinate = (gridField: GridField) => (coo: Vector2): Vector2 => {
	return Vec2.divide(Vec2.subtract(coo, gridField.position), gridField.cellSize);
};

// export function fromContinuousField(start: Vector2, size: Vector2, cellSize: number, field: ScalarField): GridScalarField {
// 	return center({
// 		cellSize, size,
// 		position: [0, 0],
// 		flatField: pipe(
// 			size,
// 			createGridPoints,
// 			map(p => Vec2.add(start, Vec2.multiply(p, cellSize))),
// 			map(field)
// 		)
// 	})
// }

export const takeCellMultiples = (multiple: number) => (field: GridField): GridField => {
	return {
		...field,
		cellSize: field.cellSize * multiple,
		size: Vec2.divide(field.size, multiple)
	}
};