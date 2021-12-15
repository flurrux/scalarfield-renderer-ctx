import { Vector2, Vector3 } from "../lib/types";
import { GridField, gridToWorldCoordinate } from "./grid-field";
import * as Vec2 from '../lib/vec2';
import { flow, pipe } from 'fp-ts/lib/function';
import { filter, flatten, map, range, reverse, sort } from 'fp-ts/lib/Array'
import { Ord } from "fp-ts/lib/number";
import { normalize } from "./util";
import { isSome, none, Option, some } from "fp-ts/lib/Option";

const unpackOptionArray: <T>(array: Option<T>[]) => T[] = flow(filter(isSome), map(o => o.value));

function isIntInRange(range: [number, number], n: number): boolean {
	return n >= range[0] && n <= range[1];
}

function transformToFieldSpace(field: GridField, position: Vector3): Vector2 {
	const flatPosition: Vector2 = [position[0], position[2]];
	return pipe(
		Vec2.subtract(flatPosition, field.position),
		Vec2.mapComponents(c => Math.round(c / field.cellSize))
	);
}

type Sign = -1 | 0 | 1;
function sign(n: number): Sign {
	return Math.sign(n) as Sign;
}

//[[minX, maxX], [minY, maxY]]
type Rect = [Vector2, Vector2];


type SignPattern = [Sign, Sign];
const signPatterns: SignPattern[] = [
	[-1, -1],
	[-1, +1],
	[+1, -1],
	[+1, +1]
];

type QuadrantRect = {
	signPattern: SignPattern,
	rect: Rect
};

const applySignPatternToVector = (signPattern: SignPattern) => (v: Vector2): Vector2 => {
	return [0, 1].map(i => v[i] * signPattern[i]) as Vector2;
};
const getQuadrantRectFromRect = (rect: Rect) => (signPattern: SignPattern): Option<QuadrantRect> => {
	const localRect = pipe(
		[0, 1],
		map(
			flow(
				i => Vec2.multiply(rect[i], signPattern[i]),
				sort(Ord)
			)
		)
	) as Rect;
	if (localRect[0][1] < 1 || localRect[1][1] < 1) return none;
	
	const localRectClamped = pipe(
		localRect,
		map(r => r.map(c => Math.max(1, c)))
	) as Rect;
	return some({
		signPattern, 
		rect: localRectClamped
	})
};
function findQuadrantRects(rect: Rect): QuadrantRect[] {
	return pipe(
		signPatterns,
		map(getQuadrantRectFromRect(rect)),
		unpackOptionArray
	) 
}

function getSortedPixelsFromQuadrantRect(quadRect: QuadrantRect): Vector2[] {
	const [minX, maxX] = quadRect.rect[0];
	const [minY, maxY] = quadRect.rect[1];
	let pixels: Vector2[] = [];
	for (let ix = maxX; ix >= minX; ix--){
		const diag = ix + maxY;
		for (let x = ix; x <= maxX; x++){
			const y = diag - x;
			if (y < minY) break;
			pixels.push([x, y]);
		}
	}
	for (let iy = maxY - 1; iy >= minY; iy--) {
		const diag = minX + iy;
		for (let x = minX; x <= maxX; x++) {
			const y = diag - x;
			if (y < minY) break;
			pixels.push([x, y]);
		}
	}
	pixels = pixels.map(applySignPatternToVector(quadRect.signPattern));
	return pixels;
}


type MainAxis = [1, 0] | [-1, 0] | [0, 1] | [0, -1];
const mainAxes: MainAxis[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
type MainGridLine = {
	axis: MainAxis,
	range: Vector2
};
const getMainLineFromRect = (rect: Rect) => (axis: MainAxis): Option<MainGridLine> => {
	const zeroIndex = axis[0] === 0 ? 0 : 1;
	const orthoRange = rect[zeroIndex];
	if (orthoRange[0] > 0 || orthoRange[1] < 0) return none;
	const nonZeroIndex = (zeroIndex + 1) % 2;
	const axisValue = axis[nonZeroIndex];

	let localAxisRange = pipe(
		rect[nonZeroIndex],
		map(r => r * axisValue),
		sort(Ord)
	) as Vector2;
	if (localAxisRange[1] < 1) return none;
	localAxisRange = Vec2.mapComponents(v => Math.max(1, v))(localAxisRange);
	return some({
		axis, range: localAxisRange
	})
};
function findMainLines(rect: Rect): MainGridLine[] {
	return pipe(
		mainAxes,
		map(getMainLineFromRect(rect)),
		unpackOptionArray
	) 
}
function getSortedPixelsFromGridLine(line: MainGridLine): Vector2[] {
	return pipe(
		range(line.range[0], line.range[1]),
		reverse,
		map(i => Vec2.multiply(line.axis, i))
	)
}


function isOriginInRect(rect: Rect): boolean {
	return rect[0][0] <= 0 && rect[0][1] >= 0 && rect[1][0] <= 0 && rect[1][1] >= 0
}

//calculate the rendering order of the scalar-field values
export function calculateScalarFieldOrder(camPosition: Vector3, field: GridField): Vector2[] {
	const relFieldPosition = Vec2.multiply(transformToFieldSpace(field, camPosition), -1);
	const rect: Rect = [0, 1].map(i => [relFieldPosition[i], relFieldPosition[i] + field.size[i] - 1]) as Rect;
	const localCoordinates = [
		...pipe(
			rect, 
			findQuadrantRects, 
			map(getSortedPixelsFromQuadrantRect),
			flatten
		),
		...pipe(
			rect,
			findMainLines,
			map(getSortedPixelsFromGridLine),
			flatten
		),
		...(isOriginInRect(rect) ? [Vec2.vector2(0, 0)] : [])
	];

	// //unsorted order, just for fun
	// let localCoordinates: Vector2[] = [];
	// for (let i = 0; i < field.size[0]; i++){
	// 	for (let j = 0; j < field.size[1]; j++){
	// 		localCoordinates.push([i, j]);
	// 	}
	// }

	return map(
		flow(
			(p: Vector2) => Vec2.subtract(p, relFieldPosition),
			gridToWorldCoordinate(field),
		)
	)(localCoordinates)
}