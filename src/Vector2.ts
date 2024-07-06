import {vec2 as gl_vec2} from "gl-matrix";
import {isNearlyEqual, lerp, toRad} from "./common.ts";
import {Matrix4} from "./Matrix4.ts";
import {ConstRefVector, RefVector} from "./RefVector.ts";

export type Vector2 = { x: number, y: number };

export const vec2 = {

    // --------------------------------- Constants ---------------------------------

    zero: Object.freeze({x: 0, y: 0}) as Readonly<Vector2>,
    one: Object.freeze({x: 1, y: 1}) as Readonly<Vector2>,
    right: Object.freeze({x: 1, y: 0}) as Readonly<Vector2>,
    up: Object.freeze({x: 0, y: 1}) as Readonly<Vector2>,


    // ---------------------------------- Creation ----------------------------------

    /**
     * Create a new Vector2 from x, y.
     * - If x, y are not provided, the vector will be (0, 0)
     * - If y is not provided, the vector will be (x, x)
     * @param x
     * @param y
     */
    new(x?: number, y?: number): Vector2 {
        if (x === undefined && y === undefined)
            return {x: 0, y: 0};

        if (x !== undefined && y === undefined)
            return {x, y: x};

        // @ts-ignore
        return {x, y};
    },

    /**
     * Create a new readonly (with Object.freeze()) Vector2 from x, y values.
     * - If x, y are not provided, the vector will be (0, 0)
     * - If y is not provided, the vector will be (x, x)
     * @param x
     * @param y
     */
    const(x: number, y: number) {
        return this.new(x, y) as Readonly<Vector2>;
    },

    /**
     * Creates a new Vector2 with the same x, y values as v
     * @param v
     */
    copy(v: Readonly<Vector2>): Vector2 {
        return this.new(v.x, v.y);
    },

    /**
     * Sets the x, y values of v to the x, y values of other
     * @param v
     * @param other
     */
    set(v: Vector2, other: Readonly<Vector2>): Vector2 {
        v.x = other.x;
        v.y = other.y;
        return v;
    },


    // ----------------------------------- Array -----------------------------------

    /**
     * Create a new Vector2 from the values of an array at an offset
     * @param arr
     * @param offset
     */
    fromArray(arr: number[] | Float32Array, offset: number = 0): Vector2 {
        return this.new(arr[offset], arr[offset + 1]);
    },

    /**
     * Put the x, y values of v into an array at an offset
     * @param v
     * @param out
     * @param offset
     */
    intoArray(v: Readonly<Vector2>, out: number[] | Float32Array, offset: number = 0) {
        out[offset] = v.x;
        out[offset + 1] = v.y;
    },

    /**
     * Returns a new array with the x, y values of v
     * @param v
     */
    toArray(v: Readonly<Vector2>): [number, number] {
        return [v.x, v.y];
    },

    /**
     * Provides getters and setters to access an array at an offset as a vector with x, y components
     * @param arr
     * @param offset
     */
    ref(arr: number[] | Float32Array, offset: number = 0): Vector2 {
        return new RefVector(arr, offset);
    },

    /**
     * Provides getters to access an array at an offset as a vector with x, y components
     * @param arr
     * @param offset
     */
    refConst(arr: number[] | Float32Array, offset: number = 0): Readonly<Vector2> {
        return new ConstRefVector(arr, offset) as Readonly<Vector2>;
    },

    // -----------------------------------------------------------------------------

    len(v: Readonly<Vector2>): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },

    lenSquared(v: Readonly<Vector2>): number {
        return v.x * v.x + v.y * v.y;
    },

    distance(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    },

    distanceSquared(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        return (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    },

    /**
     * Normalize the vector v
     * @param v
     * @param out Result of v normalized (If not provided a new instance is created)
     */
    normalize(v: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        const len = this.len(v);

        if (len === 0)
            return this.set(out, v);

        const invLen = 1.0 / len;
        out.x = v.x * invLen;
        out.y = v.y * invLen;

        return out;
    },


    // -------------------------------- Arithmetic --------------------------------

    /**
     * Add two vectors a, b
     * @param a First operand
     * @param b Second operand
     * @param out Result of a + b (If not provided a new instance is created)
     */
    add(a: Readonly<Vector2>, b: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        return out;
    },

    /**
     * Subtract two vectors a, b
     * @param a First operand
     * @param b Second operand
     * @param out Result of a - b (If not provided a new instance is created)
     */
    sub(a: Readonly<Vector2>, b: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        return out;
    },

    /**
     * Multiply the vector a by the vector or scalar b
     * @param a First operand
     * @param b Second operand (Vector2 or scalar)
     * @param out Result of a * b (If not provided a new instance is created)
     */
    mul(a: Readonly<Vector2>, b: Readonly<Vector2> | number, out: Vector2 = {x: 0, y: 0}): Vector2 {
        if (typeof b === "number") {
            out.x = a.x * b;
            out.y = a.y * b;
        } else {
            out.x = a.x * b.x;
            out.y = a.y * b.y;
        }
        return out;
    },

    /**
     * Divide the vector a by the vector or scalar b
     * @param a First operand
     * @param b Second operand (Vector2 or scalar)
     * @param out Result of a / b (If not provided a new instance is created)
     */
    div(a: Readonly<Vector2>, b: Readonly<Vector2> | number, out: Vector2 = {x: 0, y: 0}): Vector2 {
        if (typeof b === "number") {
            out.x = a.x / b;
            out.y = a.y / b;
        } else {
            out.x = a.x / b.x;
            out.y = a.y / b.y;
        }
        return out;
    },

    /**
     * Negated vector v (-x, -y)
     * @param v Vector to negate
     * @param out Result of -v (If not provided a new instance is created)
     */
    negate(v: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = -v.x;
        out.y = -v.y;
        return out;
    },


    // ----------------------------------- Angle -----------------------------------

    dot(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        return a.x * b.x + a.y * b.y;
    },

    /**
     * Create a new Vector2 from an angle in degrees
     * @param degrees
     * @param out (If not provided a new instance is created)
     */
    fromAngle(degrees: number, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.cos(degrees * toRad);
        out.y = Math.sin(degrees * toRad);
        return out;
    },

    /**
     * Rotate v by the given angle in degrees
     * @param v
     * @param degrees
     * @param out Result of v rotated by degrees (If not provided a new instance is created)
     */
    rotate(v: Readonly<Vector2>, degrees: number, out: Vector2 = {x: 0, y: 0}): Vector2 {
        const cos = Math.cos(degrees * toRad);
        const sin = Math.sin(degrees * toRad);
        out.x = v.x * cos - v.y * sin;
        out.y = v.x * sin + v.y * cos;
        return out;
    },


    // -----------------------------------------------------------------------------

    /**
     * Max vector between a and b
     * @param a
     * @param b
     * @param out Result of max(a, b) (If not provided a new instance is created)
     */
    max(a: Readonly<Vector2>, b: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        return out;
    },

    /**
     * Min vector between a and b
     * @param a
     * @param b
     * @param out Result of min(a, b) (If not provided a new instance is created)
     */
    min(a: Readonly<Vector2>, b: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        return out;
    },

    /**
     * Clamp vector v components between min and max
     * @param v
     * @param min
     * @param max
     * @param out Result of clamp(v, min, max) (If not provided a new instance is created)
     */
    clamp(v: Readonly<Vector2>, min: Readonly<Vector2>, max: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.min(Math.max(v.x, min.x), max.x);
        out.y = Math.min(Math.max(v.y, min.y), max.y);
        return out;
    },

    /**
     * Absolute value of vector v
     * @param v
     * @param out Result of abs(v) (If not provided a new instance is created)
     */
    abs(v: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.abs(v.x);
        out.y = Math.abs(v.y);
        return out;
    },

    /**
     * Component-wise equality between vectors a and b at the given tolerance
     * @param a
     * @param b
     * @param tolerance
     */
    equals(a: Readonly<Vector2>, b: Readonly<Vector2>, tolerance = 0.001): boolean {
        return isNearlyEqual(a.x, b.x, tolerance) && isNearlyEqual(a.y, b.y, tolerance);
    },

    /**
     * Checks that all components of the vector are not NAN and are finite
     * @param value
     */
    isValid(value: Readonly<Vector2>): boolean {
        return !isNaN(value.x) && !isNaN(value.y) && isFinite(value.x) && isFinite(value.y);
    },

    // -----------------------------------------------------------------------------

    /**
     * Linear interpolation between vectors a and b by alpha
     * @param a starting vector
     * @param b ending vector
     * @param alpha interpolation value (between 0, 1)
     * @param out Result of the interpolation (If not provided a new instance is created)
     */
    lerp(a: Readonly<Vector2>, b: Readonly<Vector2>, alpha: number, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = lerp(a.x, b.x, alpha);
        out.y = lerp(a.y, b.y, alpha);
        return out;
    },

    /**
     * Transform the vector v by the transformation matrix
     * @param v Vector2 to be transformed
     * @param m Transformation matrix
     * @param out Result of v transformed by m (If not provided a new instance is created)
     */
    transform(v: Readonly<Vector2>, m: Readonly<Matrix4>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        const v2 = gl_vec2.transformMat4(gl_vec2.create(), this.toArray(v), m);
        out.x = v2[0];
        out.y = v2[1];
        return out;
    },
};