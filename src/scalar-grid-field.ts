import { range } from "fp-ts/lib/Array";
import { constant, flow } from "fp-ts/lib/function";
import { values } from "fp-ts/lib/Map";
import { Ord } from "fp-ts/lib/number";
import { clamp } from "fp-ts/lib/Ord";
import { Vector2 } from "../lib/types";
import { mapComponents, subtract } from "../lib/vec2";
import { GridField, gridToWorldCoordinate, ScalarField, worldToGridCoordinate } from "./grid-field";
import { interpolate } from "./util";

export type GridScalarField = GridField & { values: number[] };


function repeatInt(s: number, n: number): number {
	return n - Math.round(Math.floor(n / s)) * s;
}
function repeatPoint(size: Vector2, point: Vector2): Vector2 {
	return [
		repeatInt(size[0], point[0]),
		repeatInt(size[1], point[1])
	]
}
export function calculateFlatIndex(width: number, [x, y]: Vector2): number {
	return y * width + x;
}
function calculateFlatRepeatingIndex(size: Vector2, point: Vector2): number {
	return calculateFlatIndex(size[0], repeatPoint(size, point));
}
function evaluateFlat2DArray<T>(size: Vector2, coo: Vector2, array: T[]): T {
	return array[calculateFlatIndex(size[0], coo)];
}
function evaluateFlatRepeating2DArray<T>(size: Vector2, [x, y]: Vector2, array: T[]): T {
	return evaluateFlat2DArray(
		size, 
		[
			repeatInt(size[0], x), 
			repeatInt(size[1], y)
		], 
		array
	);
}
function evaluateFlatClamped2DArray<T>(size: Vector2, [x, y]: Vector2, array: T[]): T {
	return evaluateFlat2DArray(
		size,
		[
			clamp(Ord)(0, size[0] - 1)(x),
			clamp(Ord)(0, size[1] - 1)(y),
		],
		array
	);
}

export const evaluateDiscrete = (field: GridScalarField) => (point: Vector2): number => {
	return evaluateFlatClamped2DArray(field.size, point, field.values);
};

//point is in grid-space
export const evaluateSmooth = (field: GridScalarField) => (point: Vector2): number => {
	const bottomLeft = mapComponents(Math.floor)(point);
	const lerpCoordinates = subtract(point, bottomLeft);
	const [x, y] = bottomLeft;
	const evalDisc = evaluateDiscrete(field);

	return interpolate(
		interpolate(
			evalDisc([x, y]),
			evalDisc([x + 1, y]),
			lerpCoordinates[0]
		),
		interpolate(
			evalDisc([x, y + 1]),
			evalDisc([x + 1, y + 1]),
			lerpCoordinates[0]
		),
		lerpCoordinates[1]
	);
};

export const evaluateByWorldCoordinate = (field: GridScalarField) => flow(
	worldToGridCoordinate(field), 
	evaluateSmooth(field),
);

export function emptyField(args: GridField): GridScalarField {
	return {
		position: args.position, 
		size: args.size, 
		cellSize: args.cellSize,
		values: range(0, (args.size[0] * args.size[1]) - 1).map(constant(0))
	}
}

export const setValueAt = (coo: Vector2, value: number) => (field: GridScalarField): GridScalarField => {
	let newValues = field.values.slice();
	newValues[calculateFlatIndex(field.size[0], coo)] = value;
	return {
		...field,
		values: newValues
	}
};

export const mapValues = (map: (v: number) => number) => (field: GridScalarField): GridScalarField => {
	return {
		...field,
		values: field.values.map(map)
	}
};

export const scale = (scale: number) => mapValues(n => n * scale);

export function init(initFunc: (p: Vector2) => number, from: GridField): GridScalarField {
	const [w, h] = from.size;
	let newValues: number[] = [];
	for (let y = 0; y < w; y++) {
		for (let x = 0; x < h; x++) {
			newValues[calculateFlatIndex(w, [x, y])] = initFunc([x, y]);
		}
	}

	return {
		...from,
		values: newValues
	}
}

export const fromContinuousField = (args: GridField, scalarField: ScalarField): GridScalarField => {
	return init(
		flow(gridToWorldCoordinate(args), scalarField),
		args
	)
};