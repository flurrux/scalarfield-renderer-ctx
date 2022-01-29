import { Morphism, Transformation, Vector3 } from '../lib/types';
import { GridField, ScalarField } from './grid-field';
import { setupSimpleCtx3dScene } from '@flurrux/simple-ctx-3d-engine/src/scene-setup';
import { renderHeightMap, Shape } from './rendering/heightmap';
import { OrbitCamera } from '@flurrux/simple-ctx-3d-engine/src/camera/orbit-camera';
import { normalize, vec3ToColor } from './util';
import { interpolate } from '../lib/vec3';


type ColorField = (p: Vector3) => string;

const defaultColorField = (function(){
	//negative values are bluish, positive ones are reddish
	const negativeColor: Vector3 = [100, 173, 232];
	const positiveColor: Vector3 = [232, 83, 42];

	return (point: Vector3): string => vec3ToColor(
		interpolate(
			negativeColor,
			positiveColor,
			normalize(-1, +1, point[1])
		)
	);
})();


export type HeightMapSceneArgs = {
	canvas?: HTMLCanvasElement,
	//the gridField only provides information about the underlying grid, not the height-values! 
	gridField: GridField,
	//this is a continuous heightMap that is used to evaluate the heights of the grid-cells
	heightMap: ScalarField,
	shape: Shape,

	colorField?: ColorField
};

export type HeightMapScene = {
	updateHeightMap: (newHeightMap: ScalarField) => void,
	updateColorField: (newColorField: ColorField) => void,
	requestRender: Morphism<void, void>,
	transformCamera: Morphism<Transformation<OrbitCamera>, void>
};


export function setupHeightMapScene(args: HeightMapSceneArgs): HeightMapScene {
	const gridField = args.gridField;
	let heightMap = args.heightMap;
	let colorField = args.colorField || defaultColorField;

	const updateHeightMap = (newHeightMap: ScalarField) => {
		heightMap = newHeightMap;
		sceneController.performRender();
	};

	const updateColorField = (newColorField: ColorField) => {
		colorField = newColorField;
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
				shape: args.shape,
				gridField: gridField,
				scalarField: heightMap,
				colorField
			});
		}
	});

	return { 
		updateHeightMap, 
		updateColorField,
		requestRender: sceneController.performRender,
		transformCamera: sceneController.transformCamera
	};
}
