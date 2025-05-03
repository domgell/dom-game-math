import {TypedArrayNonBigInt} from "@domgell/ts-util";
import {vec2} from "./Vector2.ts";
import {Vector2} from "./Vector2.ts";
import {lerp, isNearlyEqual} from "./common.ts";
import {Matrix4} from "./Matrix4.ts";
import {vec4 as gl_vec4} from "gl-matrix";
import {vec3 as gl_vec3} from "gl-matrix";
import {Quaternion, quat} from "./Quaternion.ts";


export type Vector3 = { x: number, y: number, z: number }

export const vec3 = {

    // ----------------------------------- Constants -----------------------------------

    /**
     * Zero vector (0, 0, 0)
     */
    zero: Object.freeze({x: 0, y: 0, z: 0}),
    /**
     * One vector (1, 1, 1)
     */
    one: Object.freeze({x: 1, y: 1, z: 1}),
    /**
     * Right vector (1, 0, 0)
     */
    right: Object.freeze({x: 1, y: 0, z: 0}),
    /**
     * Up vector (1, 1, 0)
     */
    up: Object.freeze({x: 0, y: 1, z: 0}),
    /**
     * Forward vector (0, 0, 1)
     */
    forward: Object.freeze({x: 0, y: 0, z: 1}),

    // --------------------------------- Constructors ----------------------------------

    /**
     * Create a new vector instance
     */
    new: ((...args: any) => {
        const a = args[0];
        const b = args[1];
        const c = args[2];

        if (typeof a === "number" && typeof b === "number" && typeof c === "number") {
            return {x: a, y: b, z: c};
        }

        if (typeof a === "number" && b === undefined && c === undefined) {
            return {x: a, y: a, z: a};
        }

        if (a === undefined && b === undefined && c === undefined) {
            return {x: 0, y: 0, z: 0};
        }

        if ("x" in a && "y" in a && typeof b === "number" && c === undefined) {
            return {x: a.x, y: a.y, z: b};
        }

        if (typeof a === "number" && "x" in b && "y" in b && c === undefined) {
            // noinspection JSSuspiciousNameCombination
            return {x: a, y: b.x, z: b.y};
        }

        throw new Error("Invalid arguments to create Vector3");
    }) as {
        /**
         * Create a new vector from `x`, `y`, `z` components
         * @param x
         * @param y
         * @param z
         */
        (x: number, y: number, z: number): Vector3,
        /**
         * Create a new vector as {x: f, y: f, z: f}
         * @param f
         */
        (f: number): Vector3,
        /**
         * Create a new vector as {x: 0, y: 0, z: 0}
         */
        (): Vector3,
        /**
         * Create a new vector as {x: v.x, y: v.y, z: z}
         * @param v
         * @param z
         */
        (v: Vector2, z: number): Vector3,
        /**
         * Create a new vector as {x: x, y: v.x, z: v.y}
         * @param x
         * @param v
         */
        (x: number, v: Vector2): Vector3,
    },

    /**
     * Create a new readonly vector instance
     */
    const: ((...args: any) => {
        return vec3.new(args);
    }) as {
        /**
         * Create a new readonly vector from `x`, `y`, `z` components
         */
        (x: number, y: number, z: number): Readonly<Vector3>,
        /**
         * Create a new readonly vector as {x: f, y: f, z: f}
         * @param f
         */
        (f: number): Readonly<Vector3>,
        /**
         * Create a new readonly vector as {x: 0, y: 0, z: 0}
         */
        (): Readonly<Vector3>,
        /**
         * Create a new readonly vector as {x: v.x, y: v.y, z: z}
         * @param v
         * @param z
         */
        (v: Vector3, z: number): Readonly<Vector3>,
        /**
         * Create a new readonly vector as {x: x, y: v.x, z: v.y}
         * @param x
         * @param v
         */
        (x: number, v: Vector3): Readonly<Vector3>,
    },

    // ------------------------------- Copy, Set, Clear --------------------------------

    /**
     * Create a new readonly vector from `other`.
     * @param other
     */
    copy(other: Readonly<Vector3>): Vector3 {
        return {x: other.x, y: other.y, z: other.z};
    },

    /**
     * Set the components of `v` and return `v`
     */
    set: ((v: Vector3, ...args: any) => {
        const a = args[0];
        const b = args[1];
        const c = args[2];

        if (typeof a === "number") {
            v.x = a;
            v.y = b;
            v.z = c;
        } else {
            v.x = a.x;
            v.y = a.y;
            v.z = a.z;
        }

        return v;
    }) as {
        /**
         * Set components of `v` to `other` and return `v`.
         */
        (v: Vector3, other: Readonly<Vector3>): Vector3,
        /**
         * Set components of `v` to `x`, `y`, `z` and return `v`.
         */
        (v: Vector3, x: number, y: number, z: number): Vector3,
    },

    /**
     * Set components of `v` to 0 and return `v`.
     * @param v
     */
    clear(v: Vector3): Vector3 {
        v.x = 0;
        v.y = 0;
        v.z = 0;
        return v;
    },

    // ------------------------------------- Array -------------------------------------

    /**
     * Create a new vector from `array` with `{x: array[offset], y: array[offset + 1], z: array[offset + 2]}`
     * @param array
     * @param offset Defaults to 0
     */
    fromArray(array: ArrayLike<number>, offset: number = 0): Vector3 {
        return {x: array[offset], y: array[offset + 1], z: array[offset + 2]};
    },
    /**
     * Put the components of `v` into `array` at an offset
     * @param v
     * @param array
     * @param offset Defaults to 0
     */
    intoArray(v: Readonly<Vector3>, array: number[] | TypedArrayNonBigInt, offset: number = 0): void {
        array[offset] = v.x;
        array[offset + 1] = v.y;
        array[offset + 2] = v.z;
    },
    /**
     * Create a new array from `v`
     * @param v
     */
    toArray(v: Readonly<Vector3>): [number, number, number] {
        return [v.x, v.y, v.z];
    },

    // ------------------------------------ Length -------------------------------------

    /**
     * Returns the length of `v` (`sqrt(dot(v, v)`)
     * @param v
     */
    len(v: Readonly<Vector3>): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    },

    /**
     * Returns the squared length of `v` (`dot(v, v)`)
     * @param v
     */
    lenSquared(v: Readonly<Vector3>): number {
        return v.x * v.x + v.y * v.y + v.z * v.z;
    },

    /**
     * Returns the distance between `a` and `b` (`sqrt(dot(a - b, a - b)`)
     * @param a
     * @param b
     */
    distance(a: Readonly<Vector3>, b: Readonly<Vector3>): number {
        return Math.sqrt(vec3.distanceSquared(a, b));
    },

    /**
     * Returns the squared distance between `a` and `b` (`dot(a - b, a - b)`)
     * @param a
     * @param b
     */
    distanceSquared(a: Readonly<Vector3>, b: Readonly<Vector3>): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return dx * dx + dy * dy + dz * dz;
    },

    // ---------------------------------- Dot, Cross -----------------------------------

    /**
     * Returns the dot product of `a` and `b`
     * @param a
     * @param b
     */
    dot(a: Readonly<Vector3>, b: Readonly<Vector3>): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    },

    /**
     * Cross product of `a` and `b`.
     * @param a
     * @param b
     * @param out Defaults to a new vector
     */
    cross(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = a.y * b.z - a.z * b.y;
        out.y = a.z * b.x - a.x * b.z;
        out.z = a.x * b.y - a.y * b.x;
        return out;
    },

    // ---------------------------------- Arithmetic -----------------------------------

    /**
     * Add `a` and `b` and put the result into `out`
     */
    add: ((a: Readonly<Vector3>, b: Readonly<Vector3> | number, out = {x: 0, y: 0, z: 0}) => {
        if (typeof b === "number") {
            out.x = a.x + b;
            out.y = a.y + b;
            out.z = a.z + b;
        } else {
            out.x = a.x + b.x;
            out.y = a.y + b.y;
            out.z = a.z + b.z;
        }

        return out;
    }) as {
        /**
         * Add `a` and `b` put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: Readonly<Vector3>, out?: Vector3): Vector3,
        /**
         * Add the scalar `b` to each component of `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: number, out?: Vector3): Vector3,
    },

    sub: ((a: Readonly<Vector3>, b: Readonly<Vector3> | number, out = {x: 0, y: 0, z: 0}) => {
        if (typeof b === "number") {
            out.x = a.x - b;
            out.y = a.y - b;
            out.z = a.z - b;
        } else {
            out.x = a.x - b.x;
            out.y = a.y - b.y;
            out.z = a.z - b.z;
        }

        return out;
    }) as {
        /**
         * Subtract `b` from `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: Readonly<Vector3>, out?: Vector3): Vector3,
        /**
         * Subtract the scalar `b` from each component of `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: number, out?: Vector3): Vector3,
    },

    mul: ((a: Readonly<Vector3>, b: Readonly<Vector3> | number, out = {x: 0, y: 0, z: 0}) => {
        if (typeof b === "number") {
            out.x = a.x * b;
            out.y = a.y * b;
            out.z = a.z * b;
        } else {
            out.x = a.x * b.x;
            out.y = a.y * b.y;
            out.z = a.z * b.z;
        }

        return out;
    }) as {
        /**
         * Multiply `a` and `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: Readonly<Vector3>, out?: Vector3): Vector3,
        /**
         * Multiply each component of `a` by the scalar `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: number, out?: Vector3): Vector3,
    },

    div: ((a: Readonly<Vector3>, b: Readonly<Vector3> | number, out = {x: 0, y: 0, z: 0}) => {
        if (typeof b === "number") {
            out.x = a.x / b;
            out.y = a.y / b;
            out.z = a.z / b;
        } else {
            out.x = a.x / b.x;
            out.y = a.y / b.y;
            out.z = a.z / b.z;
        }

        return out;
    }) as {
        /**
         * Divide `a` by `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: Readonly<Vector3>, out?: Vector3): Vector3,
        /**
         * Divide each component of `a` by the scalar `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: number, out?: Vector3): Vector3,
    },

    /**
     * Negate the components of `v` and put the result in `out` and return `out`.
     * @param v
     * @param out
     */
    negate(v: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = -v.x;
        out.y = -v.y;
        out.z = -v.z;
        return out;
    },

    // --------------------------------- Max, Min, Abs ---------------------------------

    /**
     * Component-wise `Math.max(a, b)`, put the result into `out` and return `out`.
     * @param a
     * @param b
     * @param out Defaults to a new vector
     */
    max(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        return out;
    },

    /**
     * Component-wise `Math.min(a, b)`, put the result into `out` and return `out`.
     * @param a
     * @param b
     * @param out Defaults to a new vector
     */
    min(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        return out;
    },

    /**
     * Component-wise `Math.abs(v)`, put the result into `out` and return `out`.
     * @param v
     * @param out Defaults to a new vector
     */
    abs(v: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = Math.abs(v.x);
        out.y = Math.abs(v.y);
        out.z = Math.abs(v.z);
        return out;
    },

    // ----------------------------------- Normalize -----------------------------------

    /**
     * Normalize `v` and put the result in `out` and return `out`.
     * @param v
     * @param out
     */
    normalize(v: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const len = vec3.len(v);
        if (len === 0) {
            out.x = 0;
            out.y = 0;
            out.z = 0;
        } else {
            const invLen = 1 / len;
            out.x = v.x * invLen;
            out.y = v.y * invLen;
            out.z = v.z * invLen;
        }
        return out;
    },

    // ------------------------------------ Equals -------------------------------------

    /**
     * Component-wise check if `a` and `b` are equal within `tolerance`
     * @param a
     * @param b
     * @param tolerance Defaults to 0.0001
     */
    equals(a: Readonly<Vector3>, b: Readonly<Vector3>, tolerance: number = 0.0001): boolean {
        return isNearlyEqual(a.x, b.x, tolerance) && isNearlyEqual(a.y, b.y, tolerance) && isNearlyEqual(a.z, b.z, tolerance);
    },

    // ------------------------------------- Valid -------------------------------------

    /**
     * Checks that all components of `v` are not NAN and are finite.
     * @param v
     */
    isValid(v: Readonly<Vector3>): boolean {
        return !isNaN(v.x) && !isNaN(v.y) && !isNaN(v.z) && isFinite(v.x) && isFinite(v.y) && isFinite(v.z);
    },

    // ------------------------------------- Lerp --------------------------------------

    lerp: ((a: Readonly<Vector3>, b: Readonly<Vector3>, alpha: number | Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}) => {
        if (typeof alpha === "number") {
            out.x = lerp(a.x, b.x, alpha);
            out.y = lerp(a.y, b.y, alpha);
            out.z = lerp(a.z, b.z, alpha);
        } else {
            out.x = lerp(a.x, alpha.x, alpha.y);
            out.y = lerp(a.y, alpha.y, alpha.y);
            out.z = lerp(a.z, alpha.z, alpha.z);
        }

        return out;
    }) as {
        /**
         * Linearly interpolates between `a` and `b` based on the components of `alpha`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param alpha
         * @param out
         */
        (a: Readonly<Vector3>, b: Readonly<Vector3>, alpha: number, out?: Vector3): Vector3,
        /**
         * Linearly interpolates between `a` and `b` based on `alpha`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param alpha
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector3>, b: Readonly<Vector3>, alpha: number, out?: Vector3): Vector3,
    },

    // ----------------------------------- Transform -----------------------------------

    /**
     * Transform `v` by `m`, put the result into `out` and return `out`.
     * @param v
     * @param m
     * @param out Defaults to a new vector
     */
    transform(v: Readonly<Vector3>, m: Readonly<Matrix4>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        // TEMP
        const t = gl_vec3.transformMat4(gl_vec3.create(), this.toArray(v), m);
        out.x = t[0];
        out.y = t[1];
        out.z = t[2];
        return out;
    },

    /**
     * Rotate `v` by `q`, put the result into `out` and return `out`.
     * @param v
     * @param q
     * @param out Defaults to a new vector
     */
    rotate(v: Readonly<Vector3>, q: Readonly<Quaternion>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        // TEMP
        const t = gl_vec3.transformQuat(gl_vec3.create(), this.toArray(v), quat.toArray(q));
        out.x = t[0];
        out.y = t[1];
        out.z = t[2];
        return out;
    },
};
