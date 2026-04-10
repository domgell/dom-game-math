import {TypedArrayNonBigInt} from "@domgell/ts-util";
import {lerp, isNearlyEqual, toRad, toDeg} from "./common";
import {vec2 as gl_vec2} from "gl-matrix";
import {Matrix4} from "./Matrix4.ts";

export type Vector2 = { x: number, y: number }

export const vec2 = {

    // ----------------------------------- Constants -----------------------------------

    /**
     * Zero vector (0, 0)
     */
    zero: Object.freeze({x: 0, y: 0}),
    /**
     * One vector (1, 1)
     */
    one: Object.freeze({x: 1, y: 1}),
    /**
     * Right vector (1, 0)
     */
    right: Object.freeze({x: 1, y: 0}),
    /**
     * Up vector (0, 1)
     */
    up: Object.freeze({x: 0, y: 1}),

    // --------------------------------- Constructors ----------------------------------

    /**
     * Create a new vector instance
     */
    new: ((...args: any): Vector2 => {
        const a = args[0];
        const b = args[1];

        if (a === undefined && b === undefined) {
            return {x: 0, y: 0};
        }

        if (b === undefined) {
            return {x: a, y: a};
        }

        return {x: a, y: b};
    }) satisfies {
        /**
         * Create a new vector with components `x` and `y`.
         * @param x
         * @param y
         */
        (x: number, y: number): Vector2,
        /**
         * Create a new vector with {x: f, y: f}.
         * @param f
         */
        (f: number): Vector2,
        /**
         * Create a new vector with components set to 0.
         */
        (): Vector2
    },

    /**
     * Create a new readonly vector
     */
    const: ((...args: any): Vector2 => {
        return vec2.new(args);
    }) satisfies {
        /**
         * Create a new readonly vector with components `x` and `y`.
         * @param x
         * @param y
         */
        (x: number, y: number): Readonly<Vector2>,
        /**
         * Create a new readonly vector with {x: f, y: f}.
         * @param f
         */
        (f: number): Readonly<Vector2>,
        /**
         * Create a new readonly vector with components set to 0.
         */
        (): Readonly<Vector2>
    },

    // ------------------------------- Copy, Set, Clear --------------------------------

    /**
     * Create a new vector instance with the same components as `other`.
     * @param other
     */
    copy(other: Readonly<Vector2>): Vector2 {
        return {x: other.x, y: other.y};
    },

    /**
     * Set the components of `v` and return `v`
     */
    set: ((v: Vector2, ...args: any): Vector2 => {
        const a = args[0];
        const b = args[1];

        if (typeof a === "number") {
            v.x = a;
            v.y = b;
        } else {
            v.x = a.x;
            v.y = a.y;
        }

        return v;
    }) satisfies {
        /**
         * Set components of `v` to `other` and return `v`.
         * @param v
         * @param other
         */
        (v: Vector2, other: Readonly<Vector2>): Vector2,
        /**
         * Set components of `v` to `x` and `y` and return `v`.
         * @param v
         * @param x
         * @param y
         */
        (v: Vector2, x: number, y: number): Vector2
    },
    /**
     * Set the components of `v` to zero and return `v`.
     * @param v
     */
    clear(v: Vector2): Vector2 {
        v.x = 0;
        v.y = 0;
        return v;
    },

    // ------------------------------------- Array -------------------------------------

    /**
     * Create a new vector from `array` with `{x: array[offset], y: array[offset + 1]}`
     * @param array
     * @param offset Defaults to 0
     */
    fromArray(array: ArrayLike<number>, offset: number = 0): Vector2 {
        return {x: array[offset], y: array[offset + 1]};
    },
    /**
     * Put the components of `v` into `array` at an offset
     * @param v
     * @param array
     * @param offset Defaults to 0
     */
    intoArray(v: Readonly<Vector2>, array: number[] | TypedArrayNonBigInt, offset: number = 0): void {
        array[offset] = v.x;
        array[offset + 1] = v.y;
    },
    /**
     * Create a new array from v
     * @param v
     */
    toArray(v: Readonly<Vector2>): [number, number] {
        return [v.x, v.y];
    },

    // ------------------------------------ Length -------------------------------------

    /**
     * Returns the length of `v` (`sqrt(dot(v, v)`)
     * @param v
     */
    len(v: Readonly<Vector2>): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },

    /**
     * Returns the squared length of `v` (`dot(v, v)`)
     * @param v
     */
    lenSquared(v: Readonly<Vector2>): number {
        return v.x * v.x + v.y * v.y;
    },

    /**
     * Returns the distance between `a` and `b` (`sqrt(dot(a - b, a - b)`)
     * @param a
     * @param b
     */
    distance(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        return Math.sqrt(vec2.distanceSquared(a, b));
    },

    /**
     * Returns the squared distance between `a` and `b` (`dot(a - b, a - b)`)
     * @param a
     * @param b
     */
    distanceSquared(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    },

    // -------------------------------------- Dot --------------------------------------

    /**
     * Returns the dot product of `a` and `b`
     * @param a
     * @param b
     */
    dot(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        return a.x * b.x + a.y * b.y;
    },

    // ---------------------------------- Arithmetic -----------------------------------

    add: ((a: Readonly<Vector2>, b: Readonly<Vector2> | number, out = {x: 0, y: 0}): Vector2 => {
        if (typeof b === "number") {
            out.x = a.x + b;
            out.y = a.y + b;
        } else {
            out.x = a.x + b.x;
            out.y = a.y + b.y;
        }

        return out;
    }) satisfies {
        /**
         * Add `a` and `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: Readonly<Vector2>, out?: Vector2): Vector2,
        /**
         * Add the scalar `b` to each component of `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: number, out?: Vector2): Vector2,
    },

    sub: ((a: Readonly<Vector2>, b: Readonly<Vector2> | number, out = {x: 0, y: 0}): Vector2 => {
        if (typeof b === "number") {
            out.x = a.x - b;
            out.y = a.y - b;
        } else {
            out.x = a.x - b.x;
            out.y = a.y - b.y;
        }

        return out;
    }) satisfies {
        /**
         * Subtract `b` from `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: Readonly<Vector2>, out?: Vector2): Vector2,
        /**
         * Subtract the scalar `b` from each component of `a`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: number, out?: Vector2): Vector2,
    },

    mul: ((a: Readonly<Vector2>, b: Readonly<Vector2> | number, out = {x: 0, y: 0}): Vector2 => {
        if (typeof b === "number") {
            out.x = a.x * b;
            out.y = a.y * b;
        } else {
            out.x = a.x * b.x;
            out.y = a.y * b.y;
        }

        return out;
    }) satisfies {
        /**
         * Multiply `a` by `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: Readonly<Vector2>, out?: Vector2): Vector2,
        /**
         * Multiply each component of `a` by the scalar `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: number, out?: Vector2): Vector2,
    },

    div: ((a: Readonly<Vector2>, b: Readonly<Vector2> | number, out = {x: 0, y: 0}): Vector2 => {
        if (typeof b === "number") {
            out.x = a.x / b;
            out.y = a.y / b;
        } else {
            out.x = a.x / b.x;
            out.y = a.y / b.y;
        }

        return out;
    }) satisfies {
        /**
         * Divide `a` by `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: Readonly<Vector2>, out?: Vector2): Vector2,
        /**
         * Divide each component of `a` by the scalar `b`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param out Defaults to a new vector
         */
        (a: Readonly<Vector2>, b: number, out?: Vector2): Vector2,
    },

    /**
     * Negate the components of `v` and put the result in `out` and return `out`.
     * @param v
     * @param out
     */
    negate(v: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = -v.x;
        out.y = -v.y;
        return out;
    },

    // --------------------------------- Max, Min, Abs ---------------------------------

    /**
     * Component-wise `Math.max(a, b)`, put the result into `out` and return `out`.
     * @param a
     * @param b
     * @param out Defaults to a new vector
     */
    max(a: Readonly<Vector2>, b: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        return out;
    },

    /**
     * Component-wise `Math.min(a, b)`, put the result into `out` and return `out`.
     * @param a
     * @param b
     * @param out Defaults to a new vector
     */
    min(a: Readonly<Vector2>, b: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        return out;
    },

    /**
     * Component-wise `Math.abs(v)`, put the result into `out` and return `out`.
     * @param v
     * @param out Defaults to a new vector
     */
    abs(v: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        out.x = Math.abs(v.x);
        out.y = Math.abs(v.y);
        return out;
    },

    // ----------------------------------- Normalize -----------------------------------

    /**
     * Normalize `v` and put the result in `out` and return `out`.
     * @param v
     * @param out
     */
    normalize(v: Readonly<Vector2>, out: Vector2 = {x: 0, y: 0}): Vector2 {
        const len = vec2.len(v);
        if (len === 0) {
            out.x = 0;
            out.y = 0;
        } else {
            const invLen = 1 / len;
            out.x = v.x * invLen;
            out.y = v.y * invLen;
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
    equals(a: Readonly<Vector2>, b: Readonly<Vector2>, tolerance: number = 0.0001): boolean {
        return isNearlyEqual(a.x, b.x, tolerance) && isNearlyEqual(a.y, b.y, tolerance);
    },

    // ------------------------------------- Valid -------------------------------------

    /**
     * Checks that all components of `v` are not NAN and are finite.
     * @param v
     */
    isValid(v: Readonly<Vector2>): boolean {
        return !isNaN(v.x) && !isNaN(v.y) && isFinite(v.x) && isFinite(v.y);
    },

    // ------------------------------------- Lerp --------------------------------------

    lerp: ((a: Readonly<Vector2>, b: Readonly<Vector2>, alpha: number | Readonly<Vector2>, out: Vector2 = {
        x: 0,
        y: 0,
    }): Vector2 => {
        if (typeof alpha === "number") {
            out.x = lerp(a.x, b.x, alpha);
            out.y = lerp(a.y, b.y, alpha);
        } else {
            out.x = lerp(a.x, alpha.x, alpha.y);
            out.y = lerp(a.y, alpha.y, alpha.y);
        }

        return out;
    }) satisfies {
        /**
         * Linearly interpolates between `a` and `b` based on the components of `alpha`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param alpha
         * @param out
         */
        (a: Readonly<Vector2>, b: Readonly<Vector2>, alpha: number, out?: Vector2): Vector2,
        /**
         * Linearly interpolates between `a` and `b` based on `alpha`, put the result into `out` and return `out`.
         * @param a
         * @param b
         * @param alpha
         * @param out
         */
        (a: Readonly<Vector2>, b: Readonly<Vector2>, alpha: number, out?: Vector2): Vector2,
    },

    // ----------------------------------- Transform -----------------------------------

    /**
     * Transform `v` by `m`, put the result into `out` and return `out`.
     * @param v
     * @param m
     * @param out
     */
    transform(v: Readonly<Vector2>, m: Matrix4, out: Vector2 = {x: 0, y: 0}): Vector2 {
        // TEMP
        const t = gl_vec2.transformMat4(gl_vec2.create(), this.toArray(v), m);
        out.x = t[0];
        out.y = t[1];
        return out;
    },

    // ------------------------------------ Rotate -------------------------------------

    /**
     * Rotate `v` by `degrees`, put the result into `out` and return `out`.
     */
    rotate(v: Readonly<Vector2>, degrees: number, out: Vector2 = {x: 0, y: 0}): Vector2 {
        const cos = Math.cos(degrees * toRad);
        const sin = Math.sin(degrees * toRad);
        const vx = v.x * cos - v.y * sin;
        const vy = v.x * sin + v.y * cos;
        out.x = vx;
        out.y = vy;
        return out;
    },

    /**
     * The angle in degrees between `a` and `b`.
     * @param a
     * @param b
     */
    angle(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        const lenA = vec2.len(a);
        const lenB = vec2.len(b);
        if (lenA === 0 || lenB === 0) {
            return 0;
        }
        const dot = vec2.dot(a, b);
        const angle = Math.acos(dot / (lenA * lenB));
        return angle * toDeg;
    },
};
