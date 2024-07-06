import {vec4 as gl_vec4} from "gl-matrix";
import {isNearlyEqual, lerp} from "./common.ts";
import {Matrix4} from "./Matrix4.ts";
import {ConstRefVector, RefVector} from "./RefVector.ts";

export type Vector4 = { x: number, y: number, z: number, w: number }

export const vec4 = {

    // --------------------------------- Constants ---------------------------------

    zero: Object.freeze({x: 0, y: 0, z: 0, w: 0}) as Readonly<Vector4>,
    one: Object.freeze({x: 1, y: 1, z: 1, w: 1}) as Readonly<Vector4>,
    red: Object.freeze({x: 1, y: 0, z: 0, w: 1}) as Readonly<Vector4>,
    green: Object.freeze({x: 0, y: 1, z: 0, w: 1}) as Readonly<Vector4>,
    blue: Object.freeze({x: 0, y: 0, z: 1, w: 1}) as Readonly<Vector4>,
    black: Object.freeze({x: 0, y: 0, z: 0, w: 1}) as Readonly<Vector4>,


    // ------------------------------------------------------------------------------

    /**
     * Create a new Vector4 from x, y, z, w.
     * - If x, y, z, w are not provided, the vector will be (0, 0, 0, 0)
     * - If y, z, w are not provided, the vector will be (x, x, x, x)
     * @param x
     * @param y
     * @param z
     * @param w
     */
    new(x?: number, y?: number, z?: number, w?: number): Vector4 {
        if (x !== undefined && y === undefined && z === undefined)
            return {x: x, y: x, z: x, w: x};

        if (x === undefined && y === undefined && z === undefined && w === undefined)
            return {x: 0, y: 0, z: 0, w: 0};

        x ??= 0;
        y ??= 0;
        z ??= 0;
        w ??= 0;

        return {x, y, z, w};
    },

    /**
     * Create a new readonly (with Object.freeze()) Vector4 from x, y, z, w values.
     * - If x, y, z, w are not provided, the vector will be (0, 0, 0, 0)
     * - If y, z, w are not provided, the vector will be (x, x, x, x)
     * @param x
     * @param y
     * @param z
     * @param w
     */
    const(x?: number, y?: number, z?: number, w?: number) {
        return Object.freeze(this.new(x, y, z, w)) as Readonly<Vector4>;
    },

    /**
     * Creates a new Vector4 with the same x, y, z, w values as v.
     * @param v
     */
    copy(v: Readonly<Vector4>): Vector4 {
        return this.new(v.x, v.y, v.z, v.w);
    },

    set(v: Vector4, other: Readonly<Vector4>): Vector4 {
        v.x = other.x;
        v.y = other.y;
        v.z = other.z;
        v.w = other.w;
        return v;
    },


    // ----------------------------------- Array -----------------------------------

    /**
     * Create a new Vector4 from the values of an array at an offset.
     * @param arr
     * @param offset
     */
    fromArray(arr: number[] | Float32Array, offset: number = 0): Vector4 {
        return this.new(arr[offset], arr[offset + 1], arr[offset + 2], arr[offset + 3]);
    },

    /**
     * Put the x, y, z, w values of v into an array at an offset.
     * @param v
     * @param out
     * @param offset
     */
    intoArray(v: Readonly<Vector4>, out: number[] | Float32Array, offset: number = 0) {
        out[offset] = v.x;
        out[offset + 1] = v.y;
        out[offset + 2] = v.z;
        out[offset + 3] = v.w;
    },

    /**
     * Returns a new array with the x, y, z, w values of v
     * @param v
     */
    toArray(v: Readonly<Vector4>): [number, number, number, number] {
        return [v.x, v.y, v.z, v.w];
    },

    /**
     * Provides getters and setters to access an array at an offset as a vector with x, y, z, w components
     * @param arr
     * @param offset
     */
    ref(arr: number[] | Float32Array, offset: number = 0): Vector4 {
        return new RefVector(arr, offset) as Vector4;
    },

    /**
     * Provides getters to access an array at an offset as a vector with x, y, z, w components
     * @param arr
     * @param offset
     */
    refConst(arr: number[] | Float32Array, offset: number = 0): Readonly<Vector4> {
        return new ConstRefVector(arr, offset) as Readonly<Vector4>;
    },

    // ------------------------------------------------------------------------------

    len(v: Readonly<Vector4>): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w);
    },

    lenSquared(v: Readonly<Vector4>): number {
        return v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w;
    },

    distance(a: Readonly<Vector4>, b: Readonly<Vector4>): number {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2 + (b.w - a.w) ** 2);
    },

    distanceSquared(a: Readonly<Vector4>, b: Readonly<Vector4>): number {
        return (b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2 + (b.w - a.w) ** 2;
    },

    /**
     * Normalize the vector v
     * @param v
     * @param out Result of v normalized (If not provided a new instance is created)
     */
    normalize(v: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        const len = this.len(v);

        if (len === 0)
            return this.set(out, v);

        const invLen = 1.0 / len;
        out.x = v.x * invLen;
        out.y = v.y * invLen;
        out.z = v.z * invLen;
        out.w = v.w * invLen;

        return out;
    },


    // -------------------------------- Arithmetic --------------------------------

    /**
     * Add the vectors a and b
     * @param a First operand
     * @param b Second operand
     * @param out Result of a + b (If not provided a new instance is created)
     */
    add(a: Readonly<Vector4>, b: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        out.w = a.w + b.w;
        return out;
    },

    /**
     * Subtract the vector b from a
     * @param a First operand
     * @param b Second operand
     * @param out Result of a - b (If not provided a new instance is created)
     */
    sub(a: Readonly<Vector4>, b: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        out.w = a.w - b.w;
        return out;
    },

    /**
     * Multiply the vector a by the vector or scalar b
     * @param a First operand
     * @param b Second operand (Vector4 or scalar)
     * @param out Result of a * b (If not provided a new instance is created)
     */
    mul(a: Readonly<Vector4>, b: Readonly<Vector4> | number, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        if (typeof b === "number") {
            out.x = a.x * b;
            out.y = a.y * b;
            out.z = a.z * b;
            out.w = a.w * b;
        } else {
            out.x = a.x * b.x;
            out.y = a.y * b.y;
            out.z = a.z * b.z;
            out.w = a.w * b.w;
        }
        return out;
    },

    /**
     * Divide the vector a by the vector or scalar b
     * @param a First operand
     * @param b Second operand (Vector4 or scalar)
     * @param out Result of a / b (If not provided a new instance is created)
     */
    div(a: Readonly<Vector4>, b: Readonly<Vector4> | number, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        if (typeof b === "number") {
            out.x = a.x / b;
            out.y = a.y / b;
            out.z = a.z / b;
            out.w = a.w / b;
        } else {
            out.x = a.x / b.x;
            out.y = a.y / b.y;
            out.z = a.z / b.z;
            out.w = a.w / b.w;
        }
        return out;
    },

    /**
     * Negated vector v (-x, -y, -z, -w)
     * @param v Vector to negate
     * @param out Result of -v (If not provided a new instance is created)
     */
    negate(v: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = -v.x;
        out.y = -v.y;
        out.z = -v.z;
        out.w = -v.w;
        return out;
    },


    // ------------------------------------------------------------------------------

    dot(a: Readonly<Vector4>, b: Readonly<Vector4>): number {
        return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    },


    // ------------------------------------------------------------------------------

    /**
     * Max vector between a and b
     * @param a
     * @param b
     * @param out Result of max(a, b) (If not provided a new instance is created)
     */
    max(a: Readonly<Vector4>, b: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        out.w = Math.max(a.w, b.w);
        return out;
    },

    /**
     * Min vector between a and b
     * @param a
     * @param b
     * @param out Result of min(a, b) (If not provided a new instance is created)
     */
    min(a: Readonly<Vector4>, b: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        out.w = Math.min(a.w, b.w);
        return out;
    },

    /**
     * Clamp vector v components between min and max
     * @param v
     * @param min
     * @param max
     * @param out Result of clamp(v, min, max) (If not provided a new instance is created)
     */
    clamp(v: Readonly<Vector4>, min: Readonly<Vector4>, max: Readonly<Vector4>, out: Vector4 = {
        x: 0,
        y: 0,
        z: 0,
        w: 0,
    }): Vector4 {
        out.x = Math.min(Math.max(v.x, min.x), max.x);
        out.y = Math.min(Math.max(v.y, min.y), max.y);
        out.z = Math.min(Math.max(v.z, min.z), max.z);
        out.w = Math.min(Math.max(v.w, min.w), max.w);
        return out;
    },

    /**
     * Absolute value of vector v
     * @param v
     * @param out Result of abs(v) (If not provided a new instance is created)
     */
    abs(v: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = Math.abs(v.x);
        out.y = Math.abs(v.y);
        out.z = Math.abs(v.z);
        out.w = Math.abs(v.w);
        return out;
    },

    /**
     * Component-wise equality between vectors a and b at the given tolerance
     * @param a
     * @param b
     * @param tolerance
     */
    equals(a: Readonly<Vector4>, b: Readonly<Vector4>, tolerance = 0.001): boolean {
        return isNearlyEqual(a.x, b.x, tolerance)
            && isNearlyEqual(a.y, b.y, tolerance)
            && isNearlyEqual(a.z, b.z, tolerance)
            && isNearlyEqual(a.w, b.w, tolerance);
    },

    /**
     * Checks that all components of the vector are not NAN and are finite
     * @param value
     */
    isValid(value: Readonly<Vector4>): boolean {
        return !isNaN(value.x) && !isNaN(value.y) && !isNaN(value.z) && !isNaN(value.w) && isFinite(value.x) && isFinite(value.y) && isFinite(value.z) && isFinite(value.w);
    },


    // ------------------------------------------------------------------------------

    /**
     * Linear interpolation between vectors a and b by alpha
     * @param a starting vector
     * @param b ending vector
     * @param alpha interpolation value (between 0, 1)
     * @param out Result of the interpolation (If not provided a new instance is created)
     */
    lerp(a: Readonly<Vector4>, b: Readonly<Vector4>, alpha: number, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = lerp(a.x, b.x, alpha);
        out.y = lerp(a.y, b.y, alpha);
        out.z = lerp(a.z, b.z, alpha);
        out.w = lerp(a.w, b.w, alpha);
        return out;
    },

    /**
     * Transform the vector v by the transformation matrix
     * @param v Vector4 to be transformed
     * @param m Transformation matrix
     * @param out Result of v transformed by m (If not provided a new instance is created)
     */
    transform(v: Readonly<Vector4>, m: Readonly<Matrix4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        const a = gl_vec4.transformMat4(gl_vec4.create(), this.toArray(v), m);
        out.x = a[0];
        out.y = a[1];
        out.z = a[2];
        out.w = a[3];
        return out;
    },
};