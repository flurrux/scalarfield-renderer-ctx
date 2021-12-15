import { sort } from "fp-ts/lib/Array";
import { Ord } from "fp-ts/lib/number";
import { drawDisc, pathPolygon, pathPolyline } from "../lib/ctx-util";
import { Vector2 } from "../lib/types";
import * as Vec2 from '../lib/vec2';
import { calculateScalarFieldOrder } from "../src/scalar-value-order";
import { interpolate } from "../src/util";

const canvas = document.body.querySelector("canvas");
const ctx = canvas.getContext("2d");
const updateCanvasSize = () => {
	const widthPx = window.innerWidth;
	const heightPx = window.innerHeight;
	const scalePx = window.devicePixelRatio || 1;
	Object.assign(canvas.style, {
		width: `${widthPx}px`,
		height: `${heightPx}px`
	});
	Object.assign(canvas, {
		width: widthPx * scalePx,
		height: heightPx * scalePx
	});
};
updateCanvasSize();

let rectCorners: [Vector2, Vector2] = [
	[0, 0], [4, 4]
];


function waitMillis(millis: number): Promise<void> {
	return new Promise(resolve => {
		return window.setTimeout(resolve, millis)
	})
}

function drawGrid(){
	ctx.save();
	ctx.translate(-0.5, -0.5);
	Object.assign(ctx, {
		lineWidth: 0.04,
		strokeStyle: "#404040",
		globalAlpha: 0.3
	});
	const [w, h] = [24, 12];
	for (let i = -w; i <= w; i++){
		ctx.beginPath();
		ctx.moveTo(i, -h);
		ctx.lineTo(i, +h);
		ctx.stroke();
	}
	for (let i = -h; i <= h; i++) {
		ctx.beginPath();
		ctx.moveTo(-w, i);
		ctx.lineTo(+w, i);
		ctx.stroke();
	}
	ctx.restore();
}
function drawVoxel(voxel: Vector2){
	ctx.save();
	ctx.transform(canvasScale, 0, 0, -canvasScale, canvas.width / 2, canvas.height / 2);
	const position = voxel;
	ctx.translate(-0.5 + position[0], -0.5 + position[1]);
	Object.assign(ctx, {
		lineWidth: 0.04,
		strokeStyle: "#363636",
		lineJoin: "round",
		fillStyle: "#877777",
		globalAlpha: 1
	});
	ctx.fillRect(0, 0, 1, 1);
	ctx.strokeRect(0, 0, 1, 1);
	ctx.restore();
}
function drawLineStripes(){
	ctx.save();
	Object.assign(ctx, {
		fillStyle: "#9bcee8",
		globalAlpha: 0.4
	});
	ctx.fillRect(-40, -0.5, 80, 1);
	ctx.fillRect(-0.5, -20, 1, 40);
	ctx.restore();
}
function drawRect(){
	const [minX, maxX] = sort(Ord)([rectCorners[0][0], rectCorners[1][0]]);
	const [minY, maxY] = sort(Ord)([rectCorners[0][1], rectCorners[1][1]]);
	Object.assign(ctx, {
		strokeStyle: "black",
		globalThis: 1,
		lineWidth: 0.06
	});
	ctx.strokeRect(minX - 0.5, minY - 0.5, maxX - minX + 1, maxY - minY + 1);
}

const canvasScale = 40;

function render(){
	ctx.fillStyle = "#d1cac0";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.save();
	ctx.transform(canvasScale, 0, 0, -canvasScale, canvas.width / 2, canvas.height / 2);

	drawLineStripes();
	drawGrid();
	drawRect();

	ctx.restore();
}


function animate(duration: number, animate: (p: number) => void): Promise<void> {
	return new Promise(resolve => {
		const startTime = window.performance.now();
		const loop = () => {
			const curTime = window.performance.now();
			const elapsedTime = Math.min(duration, (curTime - startTime));
			animate(elapsedTime / duration);
			render();
			if (elapsedTime < duration){
				requestAnimationFrame(loop);
			}
			else {
				resolve();
			}
		};
		requestAnimationFrame(loop);
	})
}
function wait(millis: number){
	return new Promise((resolve) => setTimeout(resolve, millis));	
}


//custom rect

function canvasToScenePoint(e: PointerEvent): Vector2 {
	return Vec2.round([
		(e.offsetX - canvas.width / 2) / canvasScale,
		(e.offsetY - canvas.height / 2) / -canvasScale,
	]);
}
canvas.addEventListener("pointerdown", e => {
	const point = canvasToScenePoint(e);
	rectCorners = [point, point];
	render();
});
canvas.addEventListener("pointermove", e => {
	if (e.buttons === 0) return;
	const point = canvasToScenePoint(e);
	rectCorners = [rectCorners[0], point];
	render();
});


async function revealVoxels(voxels: Vector2[]){
	for (const voxel of voxels){
		drawVoxel(voxel);
		await wait(100);
	}
}
document.addEventListener("keydown", e => {
	if (e.code !== "Space") return;
	const [minX, maxX] = sort(Ord)([rectCorners[0][0], rectCorners[1][0]]);
	const [minY, maxY] = sort(Ord)([rectCorners[0][1], rectCorners[1][1]]);
	const voxelPoints = calculateScalarFieldOrder(
		[0, 0, 0], 
		{
			cellSize: 1,
			position: [minX, minY],
			size: [maxX - minX, maxY - minY],
			flatField: null
		}
	);
	revealVoxels(voxelPoints);
});


render();
// playAnimation();