import {vec2 as gl_vec2, vec3 as gl_vec3, vec4 as gl_vec4, mat4 as gl_mat4, quat as gl_quat} from "gl-matrix";
import {isNearlyEqual, lerp, toRad} from "./common.ts";
import {Matrix4} from "./Matrix4.ts";
import {Quaternion} from "./Quaternion.ts";
import {ConstRefVector, RefVector} from "./RefVector.ts";

export type Vector3 = { x: number, y: number, z: number };

export const vec3 = {

    // --------------------------------- Constants ---------------------------------

    zero: Object.freeze({x: 0, y: 0, z: 0}) as Readonly<Vector3>,
    one: Object.freeze({x: 1, y: 1, z: 1}) as Readonly<Vector3>,
    right: Object.freeze({x: 1, y: 0, z: 0}) as Readonly<Vector3>,
    up: Object.freeze({x: 0, y: 1, z: 0}) as Readonly<Vector3>,
    forward: Object.freeze({x: 0, y: 0, z: 1}) as Readonly<Vector3>,


    // -----------------------------------------------------------------------------

    /**
     * Create a new Vector3 from x, y, z.
     * - If x, y, z are not provided, the vector will be (0, 0, 0)
     * - If y, z are not provided, the vector will be (x, x, x)
     * @param x
     * @param y
     * @param z
     */
    new(x?: number, y?: number, z?: number): Vector3 {
        if (x === undefined && y === undefined && z === undefined)
            return {x: 0, y: 0, z: 0};

        if (x !== undefined && y === undefined && z === undefined)
            return {x, y: x, z: x};

        if (x !== undefined && y !== undefined && z === undefined)
            return {x, y, z: y};

        // @ts-ignore
        return {x, y, z};
    },

    /**
     * Create a new readonly (with Object.freeze()) Vector3 from x, y, z values.
     * - If x, y, z are not provided, the vector will be (0, 0, 0)
     * - If y, z are not provided, the vector will be (x, x, x)
     * @param x
     * @param y
     * @param z
     */
    const(x?: number, y?: number, z?: number) {
        return Object.freeze(this.new(x, y, z)) as Readonly<Vector3>;
    },

    /**
     * Creates a new Vector3 with the same x, y, z values as v.
     * @param v
     */
    copy(v: Readonly<Vector3>): Vector3 {
        return this.new(v.x, v.y, v.z);
    },

    /**
     * Set the x, y, z values of v to the x, y, z values of other.
     * @param v
     * @param other
     */
    set(v: Vector3, other: Readonly<Vector3>): Vector3 {
        v.x = other.x;
        v.y = other.y;
        v.z = other.z;
        return v;
    },


    // ----------------------------------- Array -----------------------------------

    /**
     * Create a new Vector3 from the values of an array at an offset.
     * @param arr
     * @param offset
     */
    fromArray(arr: number[] | Float32Array, offset: number = 0): Vector3 {
        return this.new(arr[offset], arr[offset + 1], arr[offset + 2]);
    },

    /**
     * Put the x, y, z values of v into an array at an offset.
     * @param v
     * @param out
     * @param offset
     */
    intoArray(v: Readonly<Vector3>, out: number[] | Float32Array, offset: number = 0) {
        out[offset] = v.x;
        out[offset + 1] = v.y;
        out[offset + 2] = v.z;
    },

    /**
     * Returns a new array with the x, y, z values of v.
     * @param v
     */
    toArray(v: Readonly<Vector3>): [number, number, number] {
        return [v.x, v.y, v.z];
    },

    /**
     * Provides getters and setters to access an array at an offset as a vector with x, y, z components
     * @param arr
     * @param offset
     */
    ref(arr: number[] | Float32Array, offset: number = 0): Vector3 {
        return new RefVector(arr, offset) as Vector3;
    },

    /**
     * Provides getters to access an array at an offset as a vector with x, y, z components
     * @param arr
     * @param offset
     */
    refConst(arr: number[] | Float32Array, offset: number = 0): Readonly<Vector3> {
        return new ConstRefVector(arr, offset) as Readonly<Vector3>;
    },

    // -----------------------------------------------------------------------------

    len(v: Readonly<Vector3>): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    },

    lenSquared(v: Readonly<Vector3>): number {
        return v.x * v.x + v.y * v.y + v.z * v.z;
    },

    distance(a: Readonly<Vector3>, b: Readonly<Vector3>): number {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
    },

    distanceSquared(a: Readonly<Vector3>, b: Readonly<Vector3>): number {
        return (b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2;
    },

    /**
     * Normalize the vector v
     * @param v
     * @param out Result of v normalized (If not provided a new instance is created)
     */
    normalize(v: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const len = this.len(v);

        if (len === 0)
            return this.set(out, v);

        const invLen = 1.0 / len;
        out.x = v.x * invLen;
        out.y = v.y * invLen;
        out.z = v.z * invLen;

        return out;
    },


    // -------------------------------- Arithmetic --------------------------------

    /**
     * Add the vectors a and b
     * @param a First operand
     * @param b Second operand
     * @param out Result of a + b (If not provided a new instance is created)
     */
    add(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        return out;
    },

    /**
     * Subtract the vector b from a
     * @param a First operand
     * @param b Second operand
     * @param out Result of a - b (If not provided a new instance is created)
     */
    sub(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        return out;
    },

    /**
     * Multiply the vector a by the vector or scalar b
     * @param a First operand
     * @param b Second operand (Vector3 or scalar)
     * @param out Result of a * b (If not provided a new instance is created)
     */
    mul(a: Readonly<Vector3>, b: Readonly<Vector3> | number, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
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
    },

    /**
     * Divide the vector a by the vector or scalar b
     * @param a First operand
     * @param b Second operand (Vector3 or scalar)
     * @param out Result of a / b (If not provided a new instance is created)
     */
    div(a: Readonly<Vector3>, b: Readonly<Vector3> | number, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
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
    },

    /**
     * Negated vector v (-x, -y, -z)
     * @param v Vector to negate
     * @param out Result of -v (If not provided a new instance is created)
     */
    negate(v: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = -v.x;
        out.y = -v.y;
        out.z = -v.z;
        return out;
    },


    // ----------------------------------------------------------------------------

    dot(a: Readonly<Vector3>, b: Readonly<Vector3>): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    },

    /**
     * Cross product of the vectors a and b
     * @param a First operand
     * @param b Second operand
     * @param out Result of a cross b (If not provided a new instance is created)
     */
    cross(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = a.y * b.z - a.z * b.y;
        out.y = a.z * b.x - a.x * b.z;
        out.z = a.x * b.y - a.y * b.x;
        return out;
    },

    /**
     * Angle between the vectors a and b in degrees
     * @param a
     * @param b
     */
    angle(a: Readonly<Vector3>, b: Readonly<Vector3>): number {
        return (Math.acos(this.dot(a, b) / (this.len(a) * this.len(b)))) * toRad;
    },

    /**
     * Projection of vector a onto vector b
     * @param a Vector to project
     * @param b Vector to project onto
     * @param out Result of a projected onto b (If not provided a new instance is created)
     */
    project(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const dot = this.dot(a, b);
        const len = this.lenSquared(b);
        return this.mul(b, dot / len, out);
    },


    // -----------------------------------------------------------------------------

    /**
     * Max vector between a and b
     * @param a
     * @param b
     * @param out Result of max(a, b) (If not provided a new instance is created)
     */
    max(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        return out;
    },

    /**
     * Min vector between a and b
     * @param a
     * @param b
     * @param out Result of min(a, b) (If not provided a new instance is created)
     */
    min(a: Readonly<Vector3>, b: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        return out;
    },

    /**
     * Clamp vector v components between min and max
     * @param v
     * @param min
     * @param max
     * @param out Result of clamp(v, min, max) (If not provided a new instance is created)
     */
    clamp(v: Readonly<Vector3>, min: Readonly<Vector3>, max: Readonly<Vector3>, out: Vector3 = {
        x: 0,
        y: 0,
        z: 0,
    }): Vector3 {
        out.x = Math.min(Math.max(v.x, min.x), max.x);
        out.y = Math.min(Math.max(v.y, min.y), max.y);
        out.z = Math.min(Math.max(v.z, min.z), max.z);
        return out;
    },

    /**
     * Absolute value of vector v
     * @param v
     * @param out Result of abs(v) (If not provided a new instance is created)
     */
    abs(v: Readonly<Vector3>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = Math.abs(v.x);
        out.y = Math.abs(v.y);
        out.z = Math.abs(v.z);
        return out;
    },

    /**
     * Component-wise equality between vectors a and b at the given tolerance
     * @param a
     * @param b
     * @param tolerance
     */
    equals(a: Readonly<Vector3>, b: Readonly<Vector3>, tolerance = 0.001): boolean {
        return isNearlyEqual(a.x, b.x, tolerance)
            && isNearlyEqual(a.y, b.y, tolerance)
            && isNearlyEqual(a.z, b.z, tolerance);
    },

    /**
     * Checks that all components of the vector are not NAN and are finite
     * @param value
     */
    isValid(value: Readonly<Vector3>): boolean {
        return !isNaN(value.x) && !isNaN(value.y) && !isNaN(value.z) && isFinite(value.x) && isFinite(value.y) && isFinite(value.z);
    },


    // -----------------------------------------------------------------------------

    /**
     * Transform the vector v by the rotation quaternion
     * @param v Vector3 to be rotated
     * @param rotation Quaternion to rotate the vector by
     * @param out Result of v rotated by rotation (If not provided a new instance is created)
     */
    rotate(v: Readonly<Vector3>, rotation: Readonly<Quaternion>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const a = gl_vec3.transformQuat(gl_vec3.create(), this.toArray(v), [rotation.x, rotation.y, rotation.z, rotation.w]);
        out.x = a[0];
        out.y = a[1];
        out.z = a[2];
        return out;
    },

    /**
     * Transform the vector v by the transformation matrix
     * @param v Vector3 to be transformed
     * @param m Transformation matrix
     * @param out Result of v transformed by m (If not provided a new instance is created)
     */
    transform(v: Readonly<Vector3>, m: Readonly<Matrix4>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const v2 = gl_vec3.transformMat4(gl_vec3.create(), this.toArray(v), m);
        out.x = v2[0];
        out.y = v2[1];
        out.z = v2[2];
        return out;
    },

    /**
     * Linear interpolation between vectors a and b by alpha
     * @param a starting vector
     * @param b ending vector
     * @param alpha interpolation value (between 0, 1)
     * @param out Result of the interpolation (If not provided a new instance is created)
     */
    lerp(a: Readonly<Vector3>, b: Readonly<Vector3>, alpha: number, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = lerp(a.x, b.x, alpha);
        out.y = lerp(a.y, b.y, alpha);
        out.z = lerp(a.z, b.z, alpha);
        return out;
    },

    /**
     * Rotate this vector on the Y axis (yaw rotation)
     * @param v
     * @param degrees
     * @param out Result of the rotation (If not provided a new instance is created)
     */
    rotateY(v: Readonly<Vector3>, degrees: number, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const cos = Math.cos(degrees * toRad);
        const sin = Math.sin(degrees * toRad);
        out.x = v.x * cos - v.z * sin;
        out.y = v.y;
        out.z = v.x * sin + v.z * cos;
        return out;
    },

    /**
     * Rotate this vector on the X axis (pitch rotation)
     * @param v
     * @param degrees
     * @param out Result of the rotation (If not provided a new instance is created)
     */
    rotateX(v: Readonly<Vector3>, degrees: number, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const cos = Math.cos(degrees * toRad);
        const sin = Math.sin(degrees * toRad);
        out.x = v.x;
        out.y = v.y * cos - v.z * sin;
        out.z = v.y * sin + v.z * cos;
        return out;
    },

    /**
     * Rotate this vector on the Z axis (roll rotation)
     * @param v
     * @param degrees
     * @param out Result of the rotation (If not provided a new instance is created)
     */
    rotateZ(v: Readonly<Vector3>, degrees: number, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const cos = Math.cos(degrees * toRad);
        const sin = Math.sin(degrees * toRad);
        out.x = v.x * cos - v.y * sin;
        out.y = v.x * sin + v.y * cos;
        out.z = v.z;
        return out;
    },
};
