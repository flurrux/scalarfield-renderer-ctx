import { Vector2, Vector3 } from '../lib/types';
import { GridField, ScalarField } from './grid-field';
import { setupSimpleCtx3dScene, RenderFuncArgs } from '@flurrux/simple-ctx-3d-engine/src/scene-setup';
import { renderHeightMap, Shape } from './rendering/heightmap';



export type HeightMapSceneArgs = {
	canvas?: HTMLCanvasElement,
	//the gridField only provides information about the underlying grid, not the height-values! 
	gridField: GridField,
	//this is a continuous heightMap that is used to evaluate the heights of the grid-cells
	heightMap: ScalarField,
	shape: Shape
};

export type HeightMapScene = {
	updateHeightMap: (newHeightMap: ScalarField) => void
};


export function setupHeightMapScene(args: HeightMapSceneArgs): HeightMapScene {
	const gridField = args.gridField;
	let heightMap = args.heightMap;

	//negative values are bluish, positive ones are reddish
	const negativeColor: Vector3 = [100, 173, 232];
	const positiveColor: Vector3 = [232, 83, 42];

	
	const updateHeightMap = (newHeightMap: ScalarField) => {
		heightMap = newHeightMap;
		sceneController.performRender();
	};

	const sceneController = setupSimpleCtx3dScene({
		canvas: args.canvas,
		backgroundColor: "#d4d3d2",
		initialCamera: {
			orbitParams: {
				radius: 14,
				latitude: 0.4,
				longitude: 0.5,
			},
			orbitCenter: [0, 0, 0],
			projectionSettings: {
				fieldOfViewDeg: 56
				// size: 5
			}
		},
		renderScene: (renderArgs) => {
			renderHeightMap({
				ctx: renderArgs.ctx, 
				camToScreen: renderArgs.camToCanvas,
				worldToCam: renderArgs.worldToCam,
				worldToScreen: renderArgs.worldToCanvas,
				camPosition: renderArgs.camera.transform.position,
				positiveColor, negativeColor, 
				shape: args.shape,
				gridField: gridField,
				scalarField: heightMap
			});
		}
	});

	return { updateHeightMap };
}
