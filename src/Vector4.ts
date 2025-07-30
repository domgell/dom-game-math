import {Vector3} from "./Vector3.ts";
import {Vector2} from "./Vector2.ts";
import {TypedArrayNonBigInt} from "@domgell/ts-util";
import {isNearlyEqual, lerp} from "./common.ts";
import {Matrix4} from "./Matrix4.ts";
import {vec4 as gl_vec4} from "gl-matrix";

export type Vector4 = { x: number, y: number, z: number, w: number }

export const vec4 = {

    // ----------------------------------- Constants -----------------------------------

    /**
     * Zero vector (0, 0, 0, 0)
     */
    zero: Object.freeze({x: 0, y: 0, z: 0, w: 0}),

    /**
     * One vector (1, 1, 1, 1)
     */
    one: Object.freeze({x: 1, y: 1, z: 1, w: 1}),

    /**
     * Red vector (1, 0, 0, 1)
     */
    red: Object.freeze({x: 1, y: 0, z: 0, w: 1}),
    
    /**
     * Green vector (0, 1, 0, 1)
     */
    green: Object.freeze({x: 0, y: 1, z: 0, w: 1}),
    
    /**
     * Blue vector (0, 0, 1, 1)
     */
    blue: Object.freeze({x: 0, y: 0, z: 1, w: 1}),

    // --------------------------------- Constructors ----------------------------------

    /**
     * Create a new vector instance
     */
    new: ((...args: any) => {
        const a = args[0];
        const b = args[1];
        const c = args[2];
        const d = args[3];

        if (typeof a === "number" && typeof b === "number") {
            return {x: a, y: b, z: c, w: d};
        }

        if (typeof a === "number") {
            return {x: a, y: a, z: a, w: a};
        }

        if (a === undefined) {
            return {x: 0, y: 0, z: 0, w: 0};
        }

        if ("x" in a && "y" in a && "z" in a) {
            return {x: a.x, y: a.y, z: a.z, w: b};
        }

        throw new Error("Invalid arguments to create Vector4");
    }) as {
        /**
         * Create a new vector from x, y, z, w components
         * @param x
         * @param y
         * @param z
         * @param w
         */
        (x: number, y: number, z: number, w: number): Vector4,
        /**
         * Create a new vector as {x: f, y: f, z: f, w: f}
         * @param f
         */
        (f: number): Vector4,
        /**
         * Create a new vector as {x: 0, y: 0, z: 0, w: 0}
         */
        (): Vector4,
        /**
         * Create a new vector with {x: v.x, y: v.y, z: v.z, w: w}
         * @param v
         * @param w
         */
        (v: Vector3, w: number): Vector4,
    },

    /**
     * Create a new readonly vector
     */
    const: ((...args: any) => {
        return vec4.new(args);
    }) as {
        /**
         * Create a new readonly vector from x, y, z, w components
         * @param x
         * @param y
         * @param z
         * @param w
         */
        (x: number, y: number, z: number, w: number): Readonly<Vector4>,
        /**
         * Create a new readonly vector as {x: f, y: f, z: f, w: f}
         * @param f
         */
        (f: number): Readonly<Vector4>,
        /**
         * Create a new readonly vector as {x: 0, y: 0, z: 0, w: 0}
         */
        (): Readonly<Vector4>,
        /**
         * Create a new readonly vector with {x: v.x, y: v.y, z: v.z, w: w}
         * @param v
         * @param w
         */
        (v: Vector3, w: number): Readonly<Vector4>,
    },

    // ------------------------------- Copy, Set, Clear --------------------------------

    /**
     * Create a new vector instance with the same components as `other`.
     * @param other
     */
    copy(other: Readonly<Vector4>): Vector4 {
        return {x: other.x, y: other.y, z: other.z, w: other.w};
    },

    /**
     * Set the components of `v` and return `v`
     */
    set: ((v: Vector4, ...args: any) => {
        const a = args[0];
        const b = args[1];
        const c = args[2];
        const d = args[3];

        if (typeof a === "number") {
            v.x = a;
            v.y = b;
            v.z = c;
            v.w = d;
        } else {
            v.x = a.x;
            v.y = a.y;
            v.z = a.z;
            v.w = a.w;
        }

        return v;
    }) as {
        /**
         * Set the components of `v` and return `v`
         */
        (v: Vector4, x: number, y: number, z: number, w: number): Vector4,
        /**
         * Set the components of `v` and return `v`
         */
        (v: Vector4, other: Readonly<Vector4>): Vector4,
    },

    /**
     * Set components of `v` to 0 and return `v`.
     */
    clear(v: Vector4): Vector4 {
        v.x = 0;
        v.y = 0;
        v.z = 0;
        v.w = 0;

        return v;
    },

    // ------------------------------------- Array -------------------------------------

    /**
     * Create a new vector from `array` with `{x: array[offset], y: array[offset + 1], z: array[offset + 2], w: array[offset + 3]}`
     * @param array
     * @param offset Defaults to 0
     */
    fromArray(array: ArrayLike<number>, offset: number = 0): Vector4 {
        return {x: array[offset], y: array[offset + 1], z: array[offset + 2], w: array[offset + 3]};
    },
    /**
     * Put the components of `v` into `array` at an offset
     * @param v
     * @param array
     * @param offset Defaults to 0
     */
    intoArray(v: Readonly<Vector4>, array: number[] | TypedArrayNonBigInt, offset: number = 0): void {
        array[offset] = v.x;
        array[offset + 1] = v.y;
        array[offset + 2] = v.z;
        array[offset + 3] = v.w;
    },
    /**
     * Create a new array from `v` with `[v.x, v.y, v.z, v.w]`
     * @param v
     */
    toArray(v: Readonly<Vector4>): [number, number, number, number] {
        return [v.x, v.y, v.z, v.w];
    },

    // ------------------------------------ Length -------------------------------------

    /**
     * Returns the length of `v` (`sqrt(dot(v, v)`)
     * @param v
     */
    len(v: Readonly<Vector4>): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w);
    },

    /**
     * Returns the squared length of `v` (`dot(v, v)`).
     * @param v
     */
    lenSquared(v: Readonly<Vector4>): number {
        return v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w;
    },

    /**
     * Returns the distance between `a` and `b` (`len(a - b)`)
     * @param a
     * @param b
     */
    distance(a: Readonly<Vector4>, b: Readonly<Vector4>): number {
        return Math.sqrt(vec4.distanceSquared(a, b));
    },

    /**
     * Returns the squared distance between `a` and `b` (`dot(a - b, a - b)`)
     * @param a
     * @param b
     */
    distanceSquared(a: Readonly<Vector4>, b: Readonly<Vector4>): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        const dw = a.w - b.w;
        return dx * dx + dy * dy + dz * dz + dw * dw;
    },

    /**
     * Normalize `v` and put the result in `out` and return `out`.
     * @param v
     * @param out Defaults to a new vector
     */
    normalize(v: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        const len = vec4.len(v);
        if (len === 0) {
            out.x = 0;
            out.y = 0;
            out.z = 0;
            out.w = 0;
        } else {
            const invLen = 1 / len;
            out.x = v.x * invLen;
            out.y = v.y * invLen;
            out.z = v.z * invLen;
            out.w = v.w * invLen;
        }

        return out;
    },

    // -------------------------------------- Dot --------------------------------------

    /**
     * Returns the dot product of `a` and `b`
     * @param a
     * @param b
     */
    dot(a: Readonly<Vector4>, b: Readonly<Vector4>): number {
        return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    },

    // ---------------------------------- Arithmetic -----------------------------------

    add: ((a: Readonly<Vector4>, b: Readonly<Vector4> | number, out = {x: 0, y: 0, z: 0, w: 0}) => {
        if (typeof b === "number") {
            out.x = a.x + b;
            out.y = a.y + b;
            out.z = a.z + b;
            out.w = a.w + b;
        } else {
            out.x = a.x + b.x;
            out.y = a.y + b.y;
            out.z = a.z + b.z;
            out.w = a.w + b.w;
        }

        return out;
    }) as {
        /**
         * Add `a` and `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: Readonly<Vector4>, out?: Vector4): Vector4,
        /**
         * Add the scalar `b` to each component of `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: number, out?: Vector4): Vector4,
    },

    sub: ((a: Readonly<Vector4>, b: Readonly<Vector4> | number, out = {x: 0, y: 0, z: 0, w: 0}) => {
        if (typeof b === "number") {
            out.x = a.x - b;
            out.y = a.y - b;
            out.z = a.z - b;
            out.w = a.w - b;
        } else {
            out.x = a.x - b.x;
            out.y = a.y - b.y;
            out.z = a.z - b.z;
            out.w = a.w - b.w;
        }

        return out;
    }) as {
        /**
         * Subtract `b` from `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: Readonly<Vector4>, out?: Vector4): Vector4,
        /**
         * Subtract the scalar `b` from each component of `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: number, out?: Vector4): Vector4,
    },

    mul: ((a: Readonly<Vector4>, b: Readonly<Vector4> | number, out = {x: 0, y: 0, z: 0, w: 0}) => {
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
    }) as {
        /**
         * Multiply `a` by `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: Readonly<Vector4>, out?: Vector4): Vector4,
        /**
         * Multiply each component of `a` by the scalar `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: number, out?: Vector4): Vector4,
    },

    div: ((a: Readonly<Vector4>, b: Readonly<Vector4> | number, out = {x: 0, y: 0, z: 0, w: 0}) => {
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
    }) as {
        /**
         * Divide `a` by `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: Readonly<Vector4>, out?: Vector4): Vector4,
        /**
         * Divide each component of `a` by the scalar `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: number, out?: Vector4): Vector4,
    },

    /**
     * Negate the components of `v` and put the result in `out` and return `out`.
     * @param v
     * @param out Defaults to a new vector
     */
    negate(v: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = -v.x;
        out.y = -v.y;
        out.z = -v.z;
        out.w = -v.w;
        return out;
    },

    // --------------------------------- Max, Min, Abs ---------------------------------

    /**
     * Component-wise `Math.max(a, b)`, put the result into `out` and return `out`.
     * @param a
     * @param b
     * @param out Defaults to a new vector
     */
    max(a: Readonly<Vector4>, b: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        out.w = Math.max(a.w, b.w);
        return out;
    },

    /**
     * Component-wise `Math.min(a, b)`, put the result into `out` and return `out`.
     * @param a
     * @param b
     * @param out Defaults to a new vector
     */
    min(a: Readonly<Vector4>, b: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        out.w = Math.min(a.w, b.w);
        return out;
    },

    /**
     * Component-wise `Math.abs(v)`, put the result into `out` and return `out`.
     * @param v
     * @param out Defaults to a new vector
     */
    abs(v: Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        out.x = Math.abs(v.x);
        out.y = Math.abs(v.y);
        out.z = Math.abs(v.z);
        out.w = Math.abs(v.w);
        return out;
    },

    // ------------------------------------- Lerp --------------------------------------

    lerp: ((a: Readonly<Vector4>, b: Readonly<Vector4>, alpha: number | Readonly<Vector4>, out: Vector4 = {x: 0, y: 0, z: 0, w: 0}) => {
        if (typeof alpha === "number") {
            out.x = lerp(a.x, b.x, alpha);
            out.y = lerp(a.y, b.y, alpha);
            out.z = lerp(a.z, b.z, alpha);
            out.w = lerp(a.w, b.w, alpha);
        } else {
            out.x = lerp(a.x, alpha.x, alpha.y);
            out.y = lerp(a.y, alpha.y, alpha.y);
            out.z = lerp(a.z, alpha.z, alpha.z);
            out.w = lerp(a.w, alpha.w, alpha.w);
        }

        return out;
    }) as {
        /**
         * Linearly interpolates between `a` and `b` based on the components of `alpha`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param alpha
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: Readonly<Vector4>, alpha: number, out?: Vector4): Vector4,
        /**
         * Linearly interpolates between `a` and `b` based on `alpha`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param alpha
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector4>, b: number, alpha: number, out?: Vector4): Vector4,
    },

    // ----------------------------------- Transform -----------------------------------

    /**
     * Transform `v` by transformation matrix `m`, put the result in `out` and return `out`.
     * @param v
     * @param m
     * @param out Defaults to a new vector
     */
    transform(v: Readonly<Vector4>, m: Matrix4, out = {x: 0, y: 0, z: 0, w: 0}): Vector4 {
        // TEMP
        const t = gl_vec4.transformMat4(gl_vec4.create(), this.toArray(v), m);
        out.x = t[0];
        out.y = t[1];
        out.z = t[2];
        out.w = t[3];
        return out;
    },

    // ------------------------------------ Equals -------------------------------------

    /**
     * Component-wise check if `a` and `b` are equal within `tolerance`
     * @param a
     * @param b
     * @param tolerance Defaults to 0.0001
     */
    equals(a: Readonly<Vector4>, b: Readonly<Vector4>, tolerance: number = 0.0001): boolean {
        return isNearlyEqual(a.x, b.x, tolerance) && isNearlyEqual(a.y, b.y, tolerance) && isNearlyEqual(a.z, b.z, tolerance) && isNearlyEqual(a.w, b.w, tolerance);
    },

    // ------------------------------------- Valid -------------------------------------

    /**
     * Checks that all components of `q` are not NAN and are finite.
     * @param q
     */
    isValid(q: Readonly<Vector4>): boolean {
        return !isNaN(q.x) && !isNaN(q.y) && !isNaN(q.z) && !isNaN(q.w) && isFinite(q.x) && isFinite(q.y) && isFinite(q.z) && isFinite(q.w);
    },
} as const;