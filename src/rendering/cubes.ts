import { pathPolygon } from "../../lib/ctx-util";
import { Vector2, Vector3 } from "../../lib/types";
import { add, multiply } from "../../lib/vec3";
import { vec3ToColor } from "../util";

type Cube = {
	center: Vector3,
	size: Vector3,
	color: Vector3
};
function getNonZeroIndex(v: Vector3): number {
	if (v[0] !== 0) return 0;
	if (v[1] !== 0) return 1;
	if (v[2] !== 0) return 2;
}
const renderCube = (ctx: CanvasRenderingContext2D) => (cube: Cube) => {
	for (const normal of voxelFaceNormals) {
		const orthoAxes = getOrthogonalAxes(normal);
		const orthoAxesInds = orthoAxes.map(getNonZeroIndex) as [number, number];
		const localFaceSize = orthoAxesInds.map(i => cube.size[i]) as Vector2;
		const localFaceVertices: Vector2[] = [
			[+localFaceSize[0], +localFaceSize[1]],
			[-localFaceSize[0], +localFaceSize[1]],
			[-localFaceSize[0], -localFaceSize[1]],
			[+localFaceSize[0], -localFaceSize[1]],
		];
		const faceCenter = add(
			cube.center, 
			multiply(
				normal, 
				cube.size[getNonZeroIndex(normal)]
			)
		);
		const curProjectionOpt = projectVoxelFace(ctx, camera, localFaceVertices, faceCenter, normal);
		if (isNone(curProjectionOpt)) continue;

		const adjustedColor = cube.color.map(Math.round) as Vector3;
		ctx.fillStyle = vec3ToColor(adjustedColor);
		pathPolygon(ctx, curProjectionOpt.value);
		ctx.fill();
		ctx.stroke();
	}
};