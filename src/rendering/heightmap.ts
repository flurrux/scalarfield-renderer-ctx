import { drawDisc } from "../../lib/ctx-util";
import { Morphism, Vector2, Vector3 } from "../../lib/types";
import { interpolate, magnitude } from "../../lib/vec3";
import { GridField, gridToWorldCoordinate, ScalarField } from "../grid-field";
import { calculateScalarFieldOrder } from "../scalar-value-order";
import { normalize, vec3ToColor } from "../util";
import { renderHeightmapQuad } from "./quads";

export type Shape = "triangle" | "cube" | "sphere";


type HeightMapRenderArgs = {
	ctx: CanvasRenderingContext2D,
	camPosition: Vector3,
	worldToCam: Morphism<Vector3, Vector3>,
	camToScreen: Morphism<Vector3, Vector2>,
	worldToScreen: Morphism<Vector3, Vector2>
	negativeColor: Vector3, positiveColor: Vector3, 
	shape: Shape,
	gridField: GridField, scalarField: ScalarField
};

const renderAtPoint = (args: HeightMapRenderArgs) => (point: Vector2) => {
	const { ctx, gridField, shape, negativeColor, positiveColor, worldToCam, camToScreen } = args;
	const cellSize = gridField.cellSize / 2;
	const y = args.scalarField(point);
	const color = interpolate(
		negativeColor, 
		positiveColor, 
		normalize(-1, +1, y)
	);

	if (shape === "cube") {
		// const cubeY = y;
		// renderCube(ctx, perspectiveCam)({
		// 	center: [point[0], cubeY / 2, point[1]],
		// 	size: [cellSize, Math.abs(cubeY / 2), cellSize],
		// 	color,
		// });
	}
	else if (shape === "sphere") {
		const point3 = [point[0], y, point[1]] as Vector3;
		const camPosition = worldToCam(point3);
		const dist = magnitude(camPosition);
		const screenPosition = camToScreen(camPosition);
		const radius = 30 / dist;
		drawDisc(ctx, screenPosition, radius + 3, { fillStyle: "black" });
		drawDisc(ctx, screenPosition, radius, { fillStyle: vec3ToColor(color) });
	}
	else if (shape === "triangle") {
		//without the offset, the center of the quad would be exactly on the center of a grid point.
		//but we actually want the corners of the quad to coincide with the corners of a grid-cell.
		//therefore we need to add an offset and also ignore the outer strip that is pushed out because of the offset
		
		renderHeightmapQuad(
			ctx, args.worldToScreen, cellSize, args.scalarField, point, color
		);
	}
};

export function renderHeightMap(args: HeightMapRenderArgs) {
	const { gridField } = args;
	const sortedPoints = calculateScalarFieldOrder(
		args.camPosition, gridField
	);
	sortedPoints.forEach(renderAtPoint(args));
}