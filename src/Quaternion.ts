import {vec2 as gl_vec2, vec3 as gl_vec3, vec4 as gl_vec4, mat4 as gl_mat4, quat as gl_quat} from "gl-matrix";
import {Vector3, vec3} from "./Vector3.ts";
import {vec4} from "./Vector4.ts";
import {isNearlyEqual, toRad} from "./common.ts";

export type Quaternion = { x: number, y: number, z: number, w: number }

type EulerOrder =
    | "YawPitchRoll"
    | "RollPitchYaw"
    | "PitchYawRoll"
    | "RollYawPitch"
    | "PitchRollYaw"
    | "YawRollPitch"

type Euler = { yaw: number, pitch: number, roll: number, order: EulerOrder }

type AxisAngle = { axis: Vector3, angle: number }

export const quat = {

    // ----------------------------------- Constants -----------------------------------

    /**
     * Identity quaternion (0, 0, 0, 1)
     */
    idt: Object.freeze({x: 0, y: 0, z: 0, w: 1}) as Readonly<Quaternion>,
    /**
     * Zero quaternion (0, 0, 0, 0)
     */
    zero: Object.freeze({x: 0, y: 0, z: 0, w: 0}) as Readonly<Quaternion>,

    // --------------------------------- Constructors ----------------------------------

    /**
     * Create a new quaternion instance
     */
    new: ((x: number = 0, y: number = 0, z: number = 0, w: number = 1) => {
        return {x, y, z, w};
    }) as {
        /**
         * Create a new quaternion with components `x`, `y`, `z`, `w`.
         * @param x
         * @param y
         * @param z
         * @param w
         */
        (x: number, y: number, z: number, w: number): Quaternion,
        /**
         * Create a new quaternion with components set to 0, 0, 0, 1.
         */
        (): Quaternion
    },

    /**
     * Create a new readonly quaternion
     */
    const: ((x: number = 0, y: number = 0, z: number = 0, w: number = 1) => {
        return quat.new(x, y, z, w) as Readonly<Quaternion>;
    }) as {
        /**
         * Create a new readonly quaternion with components `x`, `y`, `z`, `w`.
         * @param x
         * @param y
         * @param z
         * @param w
         */
        (x: number, y: number, z: number, w: number): Readonly<Quaternion>,
        /**
         * Create a new readonly quaternion with components set to 0, 0, 0, 1.
         */
        (): Readonly<Quaternion>
    },

    // ------------------------------- Copy, Set, Clear --------------------------------

    /**
     * Create a new quaternion instance with the same components as `other`.
     * @param other
     */
    copy(other: Readonly<Quaternion>): Quaternion {
        return vec4.copy(other);
    },

    /**
     * Set the components of `q` and return `q`
     */
    set: ((q: Quaternion, ...args: any) => {
        const a = args[0];
        const b = args[1];
        const c = args[2];
        const d = args[3];

        if (typeof a === "number") {
            q.x = a;
            q.y = b;
            q.z = c;
            q.w = d;
        } else {
            q.x = a.x;
            q.y = a.y;
            q.z = a.z;
            q.w = a.w;
        }

        return q;
    }) as {
        /**
         * Set components of `q` to `other` and return `q`.
         * @param q
         * @param other
         */
        (q: Quaternion, other: Readonly<Quaternion>): Quaternion,
        /**
         * Set components of `q` to `x`, `y`, `z`, `w` and return `q`.
         * @param q
         * @param x
         * @param y
         * @param z
         * @param w
         */
        (q: Quaternion, x: number, y: number, z: number, w: number): Quaternion
    },

    /**
     * Set components of `q` to 0 and return `q`.
     * @param q
     */
    clear(q: Quaternion): Quaternion {
        return vec4.clear(q);
    },

    // ------------------------------------- Array -------------------------------------

    /**
     * Create a new quaternion from `array` with `{x: array[offset], y: array[offset + 1], z: array[offset + 2], w: array[offset + 3]}`
     * @param array
     * @param offset Defaults to 0
     */
    fromArray(array: ArrayLike<number>, offset: number = 0): Quaternion {
        return vec4.fromArray(array, offset);
    },

    /**
     * Put the components of `q` into `array` at an offset
     * @param q
     * @param array
     * @param offset Defaults to 0
     */
    intoArray(q: Readonly<Quaternion>, array: number[] | Float32Array, offset: number = 0) {
        vec4.intoArray(q, array, offset);
    },

    /**
     * Create a new array from `q`
     * @param q
     */
    toArray(q: Readonly<Quaternion>): [number, number, number, number] {
        return vec4.toArray(q);
    },

    // ------------------------------------ Length -------------------------------------

    /**
     * Returns the length of `q` (`sqrt(dot(q, q)`)
     * @param q
     */
    len(q: Readonly<Quaternion>): number {
        return vec4.len(q);
    },

    /**
     * Returns the squared length of `q` (`dot(q, q)`)
     * @param q
     */
    lenSquared(q: Readonly<Quaternion>): number {
        return vec4.lenSquared(q);
    },

    /**
     * Normalize `q` and put the result in `out` and return `out`.
     * @param q
     * @param out Defaults to a new vector
     */
    normalize(q: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        return vec4.normalize(q, out);
    },

    // ------------------------------- Conjugate, Invert -------------------------------

    /**
     * Conjugates the quaternion `q`.
     * @param q
     * @param out Defaults to new identity quaternion
     */
    conjugate(q: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        out.x = -q.x;
        out.y = -q.y;
        out.z = -q.z;
        out.w = q.w;
        return out;
    },

    /**
     * Inverts the quaternion `q`, puts the result in `out` and returns `out´.
     * @param q
     * @param out Defaults to new identity quaternion
     */
    invert(q: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        const q1 = gl_quat.invert(gl_quat.create(), this.toArray(q));
        return this.set(out, this.fromArray(q1));
    },

    // ----------------------------------- Multiply -----------------------------------

    /**
     * Multiplies quaternion `a` by quaternion `b`, puts the result in `out` and returns `out´.
     * @param a
     * @param b
     * @param out Defaults to new identity quaternion
     */
    mul(a: Readonly<Quaternion>, b: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        const q = gl_quat.create();
        gl_quat.mul(q, this.toArray(a), this.toArray(b));
        return this.set(out, this.fromArray(q));
    },

    // ------------------------------------ Equals -------------------------------------

    /**
     * Component-wise check if `a` and `b` are equal within `tolerance`
     * @param a
     * @param b
     * @param tolerance Defaults to 0.0001
     */
    equals(a: Readonly<Quaternion>, b: Readonly<Quaternion>, tolerance: number = 0.0001): boolean {
        return vec4.equals(a, b, tolerance);
    },

    // ------------------------------------- Valid -------------------------------------

    /**
     * Checks that all components of `q` are not NAN and are finite.
     * @param q
     */
    isValid(q: Readonly<Quaternion>): boolean {
        return vec4.isValid(q);
    },

    // ----------------------------------- Euler ------------------------------------

    /**
     * Creates a quaternion from the given euler angles (in degrees).
     * Default order is "YawPitchRoll"
     * @param euler
     * @param out Defaults to new identity quaternion
     */
    fromEuler(euler: Partial<Euler>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        euler.order ??= "PitchYawRoll";
        euler.pitch ??= 0;
        euler.yaw ??= 0;
        euler.roll ??= 0;

        const q = gl_quat.create();

        switch (euler.order) {
            case "YawPitchRoll":
                gl_quat.rotateY(q, q, euler.yaw * toRad);
                gl_quat.rotateX(q, q, euler.pitch * toRad);
                gl_quat.rotateZ(q, q, euler.roll * toRad);
                break;
            case "RollPitchYaw":
                gl_quat.rotateZ(q, q, euler.roll * toRad);
                gl_quat.rotateX(q, q, euler.pitch * toRad);
                gl_quat.rotateY(q, q, euler.yaw * toRad);
                break;
            case "PitchYawRoll":
                gl_quat.rotateX(q, q, euler.pitch * toRad);
                gl_quat.rotateY(q, q, euler.yaw * toRad);
                gl_quat.rotateZ(q, q, euler.roll * toRad);
                break;
            case "RollYawPitch":
                gl_quat.rotateZ(q, q, euler.roll * toRad);
                gl_quat.rotateY(q, q, euler.yaw * toRad);
                gl_quat.rotateX(q, q, euler.pitch * toRad);
                break;
            case "PitchRollYaw":
                gl_quat.rotateX(q, q, euler.pitch * toRad);
                gl_quat.rotateZ(q, q, euler.roll * toRad);
                gl_quat.rotateY(q, q, euler.yaw * toRad);
                break;
            case "YawRollPitch":
                gl_quat.rotateY(q, q, euler.yaw * toRad);
                gl_quat.rotateZ(q, q, euler.roll * toRad);
                gl_quat.rotateX(q, q, euler.pitch * toRad);
                break;
        }

        gl_quat.normalize(q, q);
        return this.set(out, this.fromArray(q));
    },

    /**
     * Rotates quaternion by the given euler angles (in degrees).
     * Default order is "YawPitchRoll"
     * @param q
     * @param euler
     * @param out Defaults to new identity quaternion
     */
    rotateEuler(q: Readonly<Quaternion>, euler: Partial<Euler>, out: Quaternion = {
        x: 0,
        y: 0,
        z: 0,
        w: 0,
    }): Quaternion {
        const q2 = this.fromEuler(euler);
        return this.mul(q, q2, out);
    },

    // ---------------------------------- AxisAngle ----------------------------------

    /**
     * Converts a quaternion to an axis-angle representation.
     * @param q
     * @param out Defaults to a new axis-angle
     */
    toAxisAngle(q: Readonly<Quaternion>, out: AxisAngle = {axis: {x: 0, y: 0, z: 0}, angle: 0}): AxisAngle {
        const axis = gl_vec3.create();
        const angle = gl_quat.getAxisAngle(axis, this.toArray(q));
        return {axis: vec3.fromArray(axis), angle};
    },

    /**
     * Creates a quaternion from an axis-angle representation.
     * @param axisAngle
     * @param out Defaults to a new quaternion
     */
    fromAxisAngle(axisAngle: Readonly<AxisAngle>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        const q = gl_quat.setAxisAngle(gl_quat.create(), vec3.toArray(axisAngle.axis), axisAngle.angle);
        return this.set(out, this.fromArray(q));
    },

    /**
     * Rotates quaternion by the given axis and angle.
     * @param q
     * @param axis
     * @param angle
     * @param out Defaults to a new quaternion
     */
    rotateAxisAngle(q: Readonly<Quaternion>, axis: Readonly<Vector3>, angle: number, out: Quaternion = {
        x: 0,
        y: 0,
        z: 0,
        w: 0,
    }): Quaternion {
        const q2 = this.fromAxisAngle({axis, angle});
        return this.mul(q, q2, out);
    },

    // ----------------------------------- Slerp -----------------------------------

    /**
     * Spherically interpolates between quaternion `a` and `b` by `alpha`.
     * @param a
     * @param b
     * @param alpha
     * @param out Defaults to a new quaternion
     */
    slerp(a: Readonly<Quaternion>, b: Readonly<Quaternion>, alpha: number, out: Quaternion = {
        x: 0,
        y: 0,
        z: 0,
        w: 0,
    }): Quaternion {
        const q = gl_quat.create();
        gl_quat.slerp(q, this.toArray(a), this.toArray(b), alpha);
        return this.set(out, this.fromArray(q));
    },

    /**
     * Rotation between two vectors.
     * @param from
     * @param to
     * @param out Defaults to a new quaternion
     */
    rotationFromTo(from: Readonly<Vector3>, to: Readonly<Vector3>, out: Quaternion = {
        x: 0,
        y: 0,
        z: 0,
        w: 0,
    }): Quaternion {
        const q = gl_quat.create();
        gl_quat.rotationTo(q, vec3.toArray(from), vec3.toArray(to));
        return this.set(out, this.fromArray(q));
    },
};