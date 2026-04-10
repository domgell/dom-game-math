export const toRad = (Math.PI / 180);
export const toDeg = (180 / Math.PI);

/**
 * Round the value to the specified number of digits
 * @param value
 * @param digits
 */
export function round(value: number, digits: number) {
    return Math.round((value + Number.EPSILON) * Math.pow(10, digits)) / Math.pow(10, digits);
}

/**
 * Linear interpolation between a and b by alpha
 * @param a
 * @param b
 * @param alpha
 */
export function lerp(a: number, b: number, alpha: number) {
    return a + (b - a) * alpha;
}

/**
 * Linear interpolation between a and b in radians by alpha
 * (wraps around 0 and 2*PI)
 * @param a
 * @param b
 * @param alpha
 */
export function radianLerp(a: number, b: number, alpha: number) {
    const a1 = (1 - alpha) * Math.cos(a) + alpha * Math.cos(b);
    const b1 = (1 - alpha) * Math.sin(a) + alpha * Math.sin(b);
    return Math.atan2(b1, a1);
}

/**
 * Linear interpolation between a and b in degrees by alpha
 * (wraps around 0 and 360)
 * @param a
 * @param b
 * @param alpha
 */
export function degreeLerp(a: number, b: number, alpha: number) {
    return radianLerp(a * toRad, b * toRad, alpha) * toDeg;
}

/**
 * Random number between min and max
 * @param min
 * @param max
 */
export function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

/**
 * Check if two numbers are equal within a tolerance
 * @param a
 * @param b
 * @param tolerance
 */
export function isNearlyEqual(a: number, b: number, tolerance: number = 0.0001) {
    return Math.abs(a - b) < tolerance;
}

/**
 * Check if a number is nearly zero within a tolerance
 * @param a
 * @param tolerance
 */
export function isNearlyZero(a: number, tolerance: number = 0.0001) {
    return Math.abs(a) < tolerance;
}

/**
 * Clamp a value between min and max
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Smooth step interpolation between a and b by alpha
 * @param a
 * @param b
 * @param alpha
 */
export function smoothStep(a: number, b: number, alpha: number) {
    alpha = clamp((alpha - a) / (b - a), 0, 1);
    return alpha * alpha * (3 - 2 * alpha);
}

/**
 * True modulo where negative values are treated correctly
 */
export function modulo(n: number, m: number): number {
    return ((n % m) + m) % m;
}

/**
 * Framerate independent linear interpolate using `Math.exp()`
 */
export function frameLerp(a: number, b: number, alpha: number) {
    if (alpha <= 0) return a;
    if (alpha >= 1) return b;
    return a + (b - a) * (1 - Math.exp(-alpha));
}