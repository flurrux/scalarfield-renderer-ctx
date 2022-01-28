import { Morphism, Vector2, Vector3 } from "../../lib/types";
import { ScalarField } from "../grid-field";
import * as Vec2 from '../../lib/vec2';
import { vec3ToColor } from "../util";
import { pathPolygon, pathPolyline } from "../../lib/ctx-util";

const localCorners: Vector2[] = [
	[+1, +1],
	[-1, +1],
	[+1, -1],
	[-1, -1]
];
const triangles: [number, number, number][] = [
	[0, 1, 3], [3, 2, 0]
];
export function renderHeightmapQuad(
	ctx: CanvasRenderingContext2D, 
	worldToScreen: Morphism<Vector3, Vector2>,
	quadSize: number, scalarField: ScalarField,
	point: Vector2, color: string) {

	const globalCorners = localCorners.map(
		(localCorner: Vector2) => {
			const corner2d = Vec2.add(point, Vec2.multiply(localCorner, quadSize));
			const y = scalarField(corner2d);
			return [corner2d[0], y, corner2d[1]] as Vector3;
		}
	);
	const verts = globalCorners.map(worldToScreen);
	ctx.fillStyle = color;
	for (const tri of triangles) {
		const triVerts = tri.map(i => verts[i]);
		pathPolygon(ctx, triVerts);
		ctx.fill();
		pathPolyline(ctx, triVerts);
		ctx.stroke();
	}
}