declare module "lib/types" {
    export type Matrix3 = [number, number, number, number, number, number, number, number, number];
    export type Vector3 = [number, number, number];
    export type Vector2 = [number, number];
    export type Morphism<A, B> = (a: A) => B;
    export type Transformation<T> = Morphism<T, T>;
}
declare module "lib/vec3" {
    type Vec3 = [number, number, number];
    export const vector3: (x: number, y: number, z: number) => Vec3;
    export const add: (a: Vec3, b: Vec3) => Vec3;
    export function sum(vectors: Vec3[]): Vec3;
    export const multiply: (vector: Vec3, scalar: number) => Vec3;
    export const subtract: (a: Vec3, b: Vec3) => Vec3;
    export const divide: (vector: Vec3, denominator: number) => Vec3;
    export const isZero: (vector: Vec3) => boolean;
    export const equal: (a: Vec3, b: Vec3) => boolean;
    export const magnitude: (vector: Vec3) => number;
    export const sqrdMagnitude: (v: Vec3) => number;
    export const normalize: (vector: Vec3) => Vec3;
    export const distance: (a: Vec3, b: Vec3) => number;
    export const dot: (a: Vec3, b: Vec3) => number;
    export const cross: (a: Vec3, b: Vec3) => Vec3;
    export const project: (normal: Vec3, point: Vec3) => Vec3;
    export const interpolate: (a: Vec3, b: Vec3, t: number) => Vec3;
    export const round: (v: Vec3) => Vec3;
}
declare module "src/util" {
    import { Vector3, Vector2, Morphism } from "lib/types";
    export const randomVector: (maxMag?: number) => Vector3;
    export const vec3ToColor: (v: Vector3) => string;
    export const randomColor: () => string;
    export const randomRange: (min: number, max: number) => number;
    export const scaleVector: (scale: number) => (vec: Vector2) => number[];
    export const randomUnitVector: () => Vector3;
    export const createArray: (length: number) => any[];
    export function normalize(from: number, to: number, value: number): number;
    export function interpolate(from: number, to: number, value: number): number;
    export const mapRange: (range1: [number, number], range2: [number, number], value: number) => number;
    export const setY: (y: number) => (v: Vector3) => Vector3;
    export const setYZero: (v: Vector3) => Vector3;
    export const flattenY: (v: Vector3) => [number, number, number];
    export const isVoxelEnclosed: (voxels: Vector3[]) => (voxel: Vector3) => boolean;
    export function removeEnclosedVoxels(voxels: Vector3[]): Vector3[];
    type LoopArgs = {
        dt: number;
        t: number;
    };
    export const startLoop: (onLoop: Morphism<LoopArgs, void>) => void;
    export function range(start: number, end: number): number[];
    export function adjustCanvasSizeToWindow(canvas: HTMLCanvasElement): void;
}
declare module "lib/vec2" {
    type Vec2 = [number, number];
    export const add: (a: Vec2, b: Vec2) => Vec2;
    export const multiply: (vector: Vec2, scalar: number) => Vec2;
    export const subtract: (a: Vec2, b: Vec2) => Vec2;
    export const divide: (vector: Vec2, denominator: number) => Vec2;
    export const isZero: (vector: Vec2) => boolean;
    export const magnitude: (vector: Vec2) => number;
    export const normalize: (vector: Vec2) => Vec2;
    export const distance: (a: Vec2, b: Vec2) => number;
    export const dot: (a: Vec2, b: Vec2) => number;
    export const mapComponents: (map: (c: number) => number) => (v: Vec2) => Vec2;
    export const round: (v: Vec2) => Vec2;
    export const vector2: (x: number, y: number) => Vec2;
    export const interpolate: (a: Vec2, b: Vec2, t: number) => Vec2;
}
declare module "src/grid-field" {
    import { Vector2 } from "lib/types";
    export type GridField = {
        cellSize: number;
        size: Vector2;
        position: Vector2;
    };
    export function center<F extends GridField>(field: F): F;
    export type ScalarField = (p: Vector2) => number;
    export const gridToWorldCoordinate: (gridField: GridField) => (coo: Vector2) => Vector2;
    export const worldToGridCoordinate: (gridField: GridField) => (coo: Vector2) => Vector2;
    export const takeCellMultiples: (multiple: number) => (field: GridField) => GridField;
}
declare module "lib/ctx-util" {
    import { Vector2 } from "lib/types";
    export const pathPolygon: (ctx: CanvasRenderingContext2D, polygon: Vector2[]) => void;
    export const pathPolyline: (ctx: CanvasRenderingContext2D, polyline: Vector2[]) => void;
    export function drawDisc(ctx: CanvasRenderingContext2D, point: Vector2, radius: number, style?: Partial<CanvasRenderingContext2D>): void;
}
declare module "src/scalar-value-order" {
    import { Vector2, Vector3 } from "lib/types";
    import { GridField } from "src/grid-field";
    export function calculateScalarFieldOrder(camPosition: Vector3, field: GridField): Vector2[];
}
declare module "src/rendering/quads" {
    import { Morphism, Vector2, Vector3 } from "lib/types";
    import { ScalarField } from "src/grid-field";
    export function renderHeightmapQuad(ctx: CanvasRenderingContext2D, worldToScreen: Morphism<Vector3, Vector2>, quadSize: number, scalarField: ScalarField, point: Vector2, color: string): void;
}
declare module "src/rendering/heightmap" {
    import { Morphism, Vector2, Vector3 } from "lib/types";
    import { GridField, ScalarField } from "src/grid-field";
    export type Shape = "triangle" | "cube" | "sphere";
    type HeightMapRenderArgs = {
        ctx: CanvasRenderingContext2D;
        camPosition: Vector3;
        worldToCam: Morphism<Vector3, Vector3>;
        camToScreen: Morphism<Vector3, Vector2>;
        worldToScreen: Morphism<Vector3, Vector2>;
        shape: Shape;
        gridField: GridField;
        scalarField: ScalarField;
        colorField: Morphism<Vector3, string>;
    };
    export function renderHeightMap(args: HeightMapRenderArgs): void;
}
declare module "src/heightmap-scene" {
    import { Morphism, Transformation, Vector3 } from "lib/types";
    import { GridField, ScalarField } from "src/grid-field";
    import { Shape } from "src/rendering/heightmap";
    import { OrbitCamera } from "node_modules/@flurrux/simple-ctx-3d-engine/src/camera/orbit-camera";
    type ColorField = (p: Vector3) => string;
    export type HeightMapSceneArgs = {
        canvas?: HTMLCanvasElement;
        gridField: GridField;
        heightMap: ScalarField;
        shape: Shape;
        colorField?: ColorField;
    };
    export type HeightMapScene = {
        updateHeightMap: (newHeightMap: ScalarField) => void;
        updateColorField: (newColorField: ColorField) => void;
        requestRender: Morphism<void, void>;
        transformCamera: Morphism<Transformation<OrbitCamera>, void>;
    };
    export function setupHeightMapScene(args: HeightMapSceneArgs): HeightMapScene;
}
declare module "src/index" {
    export { setupHeightMapScene } from "src/heightmap-scene";
    export { center as centerGridField } from "src/grid-field";
    export { startLoop } from "src/util";
}
