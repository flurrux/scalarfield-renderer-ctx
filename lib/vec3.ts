
type Vec3 = [number, number, number];

export const vector3 = (x: number, y: number, z: number): Vec3 => [x, y, z];

export const add = (a: Vec3, b: Vec3): Vec3 => [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2]
];
export function sum(vectors: Vec3[]): Vec3 {
	let sum: Vec3 = [0, 0, 0];
	for (const vec of vectors){
		sum[0] += vec[0];
		sum[1] += vec[1];
		sum[2] += vec[2];
	}
	return sum;
}
export const multiply = (vector: Vec3, scalar: number): Vec3 => [
    vector[0] * scalar,
    vector[1] * scalar,
    vector[2] * scalar
];
export const subtract = (a: Vec3, b: Vec3): Vec3 => add(a, multiply(b, -1));
export const divide = (vector: Vec3, denominator: number) => multiply(vector, 1 / denominator);

export const isZero = (vector: Vec3): boolean => vector.every(component => component === 0);
export const equal = (a: Vec3, b: Vec3): boolean => isZero(subtract(a, b));
export const magnitude = (vector: Vec3): number => Math.hypot(...vector);
export const sqrdMagnitude = (v: Vec3): number => v[0]**2 + v[1]**2 + v[2]**2;
export const normalize = (vector: Vec3): Vec3 => isZero(vector) ? [0, 0, 0] : divide(vector, magnitude(vector));
export const distance = (a: Vec3, b: Vec3): number => magnitude(subtract(a, b));
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - b[1] * a[2],
    a[2] * b[0] - b[2] * a[0],
    a[0] * b[1] - b[0] * a[1]
];
export const project = (normal: Vec3, point: Vec3): Vec3 => {
	return multiply(normal, dot(normal, point));
};
export const interpolate = (a: Vec3, b: Vec3, t: number): Vec3 => add(a, multiply(subtract(b, a), t));
export const round = (v: Vec3): Vec3 => v.map(Math.round) as Vec3;