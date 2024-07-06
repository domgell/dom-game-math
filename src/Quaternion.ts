import {vec2 as gl_vec2, vec3 as gl_vec3, vec4 as gl_vec4, mat4 as gl_mat4, quat as gl_quat} from "gl-matrix";
import {Vector3, vec3} from "./Vector3.ts";
import {vec4} from "./Vector4.ts";
import {toRad} from "./common.ts";
import {ConstRefVector, RefVector} from "./RefVector.ts";

export type Quaternion = {x: number, y: number, z: number, w: number}

type EulerOrder =
    "YawPitchRoll"
    | "RollPitchYaw"
    | "PitchYawRoll"
    | "RollYawPitch"
    | "PitchRollYaw"
    | "YawRollPitch"
type Euler = { yaw: number, pitch: number, roll: number, order: EulerOrder }

type AxisAngle = { axis: Vector3, angle: number }

export const quat = {

    // --------------------------------- Constants ---------------------------------

    idt: Object.freeze({x: 0, y: 0, z: 0, w: 1}) as Readonly<Quaternion>,
    zero: Object.freeze({x: 0, y: 0, z: 0, w: 0}) as Readonly<Quaternion>,


    // ------------------------------------------------------------------------------

    /**
     * Creates a new quaternion with the given components.
     * - If x, y, z, w are not provided the quaternion will be (0, 0, 0, 1)
     * @param x
     * @param y
     * @param z
     * @param w
     */
    new(x: number = 0, y: number = 0, z: number = 0, w: number = 1): Quaternion {
        return {x, y, z, w};
    },

    /**
     * Creates a new readonly (with Object.freeze()) quaternion with the given components.
     * - If x, y, z, w are not provided the quaternion will be (0, 0, 0, 1)
     * @param x
     * @param y
     * @param z
     * @param w
     */
    const(x: number, y: number, z: number, w: number) {
        return Object.freeze(this.new(x, y, z, w)) as Readonly<Quaternion>;
    },

    /**
     * Creates a new quaternion with the same x, y, z, w values as q.
     * @param q
     */
    copy(q: Readonly<Quaternion>): Quaternion {
        return this.new(q.x, q.y, q.z, q.w);
    },

    /**
     * Sets the x, y, z, w components of q to the x, y, z, w values of other.
     * @param q
     * @param other
     */
    set(q: Quaternion, other: Readonly<Quaternion>): Quaternion {
        return vec4.set(q, other);
    },

    // ----------------------------------- Array -----------------------------------

    /**
     * Creates a new quaternion from the values of an array at an offset.
     * @param arr
     * @param offset
     */
    fromArray(arr: number[] | Float32Array, offset: number = 0): Quaternion {
        return vec4.fromArray(arr, offset);
    },

    /**
     * Put the x, y, z, w values of q into an array at an offset.
     * @param q
     * @param out
     * @param offset
     */
    intoArray(q: Readonly<Quaternion>, out: number[] | Float32Array, offset: number = 0) {
        vec4.intoArray(q, out, offset);
    },

    /**
     * Returns a new array with the x, y, z, w values of q
     * @param q
     */
    toArray(q: Readonly<Quaternion>): [number, number, number, number] {
        return vec4.toArray(q);
    },

    /**
     * Provides getters and setters to access an array at an offset as a quaternion with x, y, z, w components
     * @param arr
     * @param offset
     */
    ref(arr: number[] | Float32Array, offset: number = 0): Quaternion {
        return new RefVector(arr, offset) as Quaternion;
    },

    /**
     * Provides getters to access an array at an offset as a quaternion with x, y, z, w components
     * @param arr
     * @param offset
     */
    refConst(arr: number[] | Float32Array, offset: number = 0): Readonly<Quaternion> {
        return new ConstRefVector(arr, offset) as Readonly<Quaternion>;
    },

    // ------------------------------------------------------------------------------

    len(q: Readonly<Quaternion>): number {
        return vec4.len(q);
    },

    lenSquared(q: Readonly<Quaternion>): number {
        return vec4.lenSquared(q);
    },

    /**
     * Normalizes the quaternion q.
     * @param q
     * @param out Result of q normalized (If not provided a new instance will be created)
     */
    normalize(q: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        return vec4.normalize(q, out);
    },

    /**
     * Conjugates the quaternion q.
     * @param q
     * @param out Result of q conjugated (If not provided a new instance will be created)
     */
    conjugate(q: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        out.x = -q.x;
        out.y = -q.y;
        out.z = -q.z;
        out.w = q.w;
        return out;
    },

    /**
     * Inverts the quaternion q.
     * @param q
     * @param out Result of q inverted (If not provided a new instance will be created)
     */
    invert(q: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        const q1 = gl_quat.invert(gl_quat.create(), this.toArray(q));
        return this.set(out, this.fromArray(q1));
    },

    /**
     * Multiplies quaternion a by quaternion b.
     * @param a
     * @param b
     * @param out Result of a * b (If not provided a new instance will be created)
     */
    mul(a: Readonly<Quaternion>, b: Readonly<Quaternion>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        const q = gl_quat.create();
        gl_quat.mul(q, this.toArray(a), this.toArray(b));
        return this.set(out, this.fromArray(q));
    },


    // ------------------------------------------------------------------------------

    /**
     * Component-wise equality between vectors a and b at the given tolerance
     * @param a
     * @param b
     * @param tolerance
     */
    equals(a: Readonly<Quaternion>, b: Readonly<Quaternion>, tolerance = 0.001): boolean {
        return vec4.equals(a, b, tolerance);
    },

    /**
     * Checks that all components of the quaternion are not NAN and are finite
     * @param value
     */
    isValid(value: Readonly<Quaternion>): boolean {
        return vec4.isValid(value);
    },


    // ----------------------------------- Euler ------------------------------------

    /**
     * Creates a quaternion from the given euler angles (in degrees).
     * Default order is "YawPitchRoll"
     * @param euler
     * @param out (If not provided a new instance will be created)
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
     * @param out (If not provided a new instance will be created)
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
     * @param out (If not provided a new instance will be created)
     */
    toAxisAngle(q: Readonly<Quaternion>, out: AxisAngle = {axis: {x: 0, y: 0, z: 0}, angle: 0}): AxisAngle {
        const axis = gl_vec3.create();
        const angle = gl_quat.getAxisAngle(axis, this.toArray(q));
        return {axis: vec3.fromArray(axis), angle};
    },

    /**
     * Creates a quaternion from an axis-angle representation.
     * @param axisAngle
     * @param out (If not provided a new instance will be created)
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
     * @param out (If not provided a new instance will be created)
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


    // ------------------------------------------------------------------------------

    /**
     * Spherically interpolates between quaternion a and b by alpha.
     * @param a
     * @param b
     * @param alpha
     * @param out Result of the interpolation (If not provided a new instance will be created)
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
     * @param out (If not provided a new instance will be created)
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