import {mat4 as gl_mat4, quat as gl_quat, vec3 as gl_vec3} from "gl-matrix";
import {quat, Quaternion} from "./Quaternion.ts";
import {vec3, Vector3} from "./Vector3.ts";
import {isNearlyEqual, toRad} from "./common.ts";

export type Matrix4 = gl_mat4

type TransformOrder = "TRS" | "RTS" | "STR" | "SRT" | "RST" | "TSR"
type Transform = { translation: Vector3, rotation: Quaternion, scale: Vector3, order: TransformOrder }

export const mat4 = {

    // --------------------------------- Constants ---------------------------------

    idt: gl_mat4.create() as Readonly<Matrix4>,
    zero: new Float32Array(16) as Readonly<Matrix4>,


    // ---------------------------------- Creation ---------------------------------

    /**
     * Creates a new matrix from the given data.
     * @param data data to create the matrix from, if not provided creates a new identity matrix
     */
    new(data?: Float32Array | number[]): Matrix4 {
        if (data === undefined) {
            return gl_mat4.create();
        } else {
            return data.slice(0, 16) as Matrix4;
        }
    },

    /**
     * Creates a new readonly matrix from the given data.
     * @param data data to create the matrix from, if not provided creates a new identity matrix
     */
    const(data?: Float32Array | number[]): Readonly<Matrix4> {
        return this.new(data);
    },

    /**
     * Creates a new matrix with the same values as m.
     * @param m
     */
    copy(m: Readonly<Matrix4>): Matrix4 {
        return gl_mat4.clone(m);
    },

    /**
     * Sets the values of m to the values of other.
     * @param m
     * @param other
     */
    set(m: Matrix4, other: Readonly<Matrix4>): Matrix4 {
        return gl_mat4.copy(m, other);
    },

    /**
     * Sets the values of m to the identity matrix.
     * @param m
     */
    identity(m: Matrix4): Matrix4 {
        return gl_mat4.identity(m);
    },


    // ----------------------------------- Array -----------------------------------

    /**
     * Returns a matrix which references and can modify the given data
     * @param data
     * @param offset
     */
    ref(data: Float32Array, offset: number = 0) {
        return new Float32Array(data.buffer, offset * 4, 16);
    },

    /**
     * Returns a readonly matrix which references but cannot modify the given data
     * @param data
     * @param offset
     */
    refConst(data: Float32Array, offset: number = 0) {
        return this.ref(data, offset) as Readonly<Matrix4>;
    },

    /**
     * Copies the values of m into target at a given offset.
     * @param m
     * @param target
     * @param offset
     */
    intoArray(m: Readonly<Matrix4>, target: Float32Array | number[], offset: number = 0) {
        for (let i = 0; i < 16; i++) {
            target[offset + i] = m[i];
        }
    },


    // ------------------------------- Operations -----------------------------------

    /**
     * Multiplies a and b.
     * @param a
     * @param b
     * @param out Result of a * b (If not provided, a new instance is created)
     */
    mul(a: Readonly<Matrix4>, b: Readonly<Matrix4>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.mul(out, a, b);
    },

    /**
     * Inverts m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    invert(m: Readonly<Matrix4>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.invert(out, m);
    },

    /**
     * Transposes m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    transpose(m: Readonly<Matrix4>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.transpose(out, m);
    },


    // -------------------------------- Translation ---------------------------------

    /**
     * Translates m by the given translation
     * @param m
     * @param translation
     * @param out (If not provided, a new instance is created)
     */
    translate(m: Readonly<Matrix4>, translation: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.translate(out, m, vec3.toArray(translation));
    },

    /**
     * Sets the translation of m to the given translation
     * @param m
     * @param translation
     * @param out (If not provided, a new instance is created)
     */
    setTranslation(m: Readonly<Matrix4>, translation: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        this.set(out, m);
        out[12] = translation.x;
        out[13] = translation.y;
        out[14] = translation.z;
        return out;
    },

    /**
     * Translation of m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    getTranslation(m: Readonly<Matrix4>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = m[12];
        out.y = m[13];
        out.z = m[14];
        return out;
    },

    /**
     * Creates a matrix with the given translation
     * @param translation
     * @param out (If not provided, a new instance is created)
     */
    fromTranslation(translation: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.fromTranslation(out, vec3.toArray(translation));
    },


    // ---------------------------------- Rotation ----------------------------------

    /**
     * Rotates m by the given rotation
     * @param m
     * @param rotation
     * @param out (If not provided, a new instance is created)
     */
    rotate(m: Readonly<Matrix4>, rotation: Readonly<Quaternion>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        const rot = gl_mat4.fromQuat(gl_mat4.create(), quat.toArray(rotation));
        return gl_mat4.mul(out, m, rot);
    },

    /**
     * Sets the rotation of m to the given rotation
     * @param m
     * @param rotation
     * @param out (If not provided, a new instance is created)
     */
    // TODO: Test
    setRotation(m: Readonly<Matrix4>, rotation: Readonly<Quaternion>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        const current = this.getRotation(m);
        quat.normalize(current, current);
        quat.invert(current, current);

        this.set(out, m);
        this.rotate(m, current, out);
        this.rotate(m, rotation, out);

        return out;
    },

    /**
     * Normalized rotation of m (without scale)
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    getRotation(m: Readonly<Matrix4>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        const q = gl_mat4.getRotation(gl_quat.create(), this.setScale(m, vec3.one));
        out.x = q[0];
        out.y = q[1];
        out.z = q[2];
        out.w = q[3];
        quat.normalize(out, out);
        return out;
    },

    /**
     * Rotation of m without removing scale
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    getRotationWithScale(m: Readonly<Matrix4>, out: Quaternion = {x: 0, y: 0, z: 0, w: 0}): Quaternion {
        const q = gl_mat4.getRotation(gl_quat.create(), m);
        out.x = q[0];
        out.y = q[1];
        out.z = q[2];
        out.w = q[3];
        quat.normalize(out, out);
        return out;
    },

    /**
     * Creates a matrix with the given rotation
     * @param rotation
     * @param out (If not provided, a new instance is created)
     */
    fromRotation(rotation: Readonly<Quaternion>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        this.identity(out)
        return this.rotate(out, rotation, out);
    },


    // --------------------------------- Scale ----------------------------------

    /**
     * Scales m by the given scale
     * @param m
     * @param scale
     * @param out (If not provided, a new instance is created)
     */
    scale(m: Readonly<Matrix4>, scale: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.scale(out, m, vec3.toArray(scale));
    },

    /**
     * Sets the scale of m to the given scale
     * @param m
     * @param scale
     * @param out (If not provided, a new instance is created)
     */
    setScale(m: Readonly<Matrix4>, scale: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        this.set(out, m);
        const current = this.getScale(m);
        vec3.div(scale, current, current);
        this.scale(out, current, out);

        return out;
    },

    /**
     * Scale of m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    getScale(m: Readonly<Matrix4>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const scale = gl_mat4.getScaling(gl_vec3.create(), m);
        out.x = scale[0];
        out.y = scale[1];
        out.z = scale[2];
        return out;
    },

    /**
     * Creates a matrix with the given scale
     * @param scale
     * @param out (If not provided, a new instance is created)
     */
    fromScale(scale: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.fromScaling(out, vec3.toArray(scale));
    },

    // ------------------------------- Transform --------------------------------

    /**
     * Creates a matrix from the given transform
     * @param transform (Default order is TRS)
     * @param out (If not provided, a new instance is created)
     */
    compose(transform: Partial<Transform>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        transform.translation ??= vec3.zero;
        transform.rotation ??= quat.idt;
        transform.scale ??= vec3.one;
        transform.order ??= "TRS";

        switch (transform.order) {
            case "TRS":
                this.fromTranslation(transform.translation, out);
                this.rotate(out, transform.rotation, out);
                this.scale(out, transform.scale, out);
                return out;
            case "RTS":
                this.fromRotation(transform.rotation, out);
                this.translate(out, transform.translation, out);
                this.scale(out, transform.scale, out);
                return out;
            case "STR":
                this.fromScale(transform.scale, out);
                this.translate(out, transform.translation, out);
                this.rotate(out, transform.rotation, out);
                return out;
            case "SRT":
                this.fromScale(transform.scale, out);
                this.rotate(out, transform.rotation, out);
                this.translate(out, transform.translation, out);
                return out;
            case "RST":
                this.fromRotation(transform.rotation, out);
                this.scale(out, transform.scale, out);
                this.translate(out, transform.translation, out);
                return out;
            case "TSR":
                this.fromTranslation(transform.translation, out);
                this.scale(out, transform.scale, out);
                this.rotate(out, transform.rotation, out);
                return out;
        }
    },

    /**
     * Decomposes the given matrix into a transform
     * @param m
     * @param out
     */
    decompose(m: Readonly<Matrix4>, out?: Partial<Transform>): Transform {
        out ??= {};

        out.translation ??= vec3.new();
        out.rotation ??= quat.new();
        out.scale ??= vec3.new(1);

        this.getTranslation(m, out.translation);
        this.getRotation(m, out.rotation);
        this.getScale(m, out.scale);

        return {translation: out.translation, rotation: out.rotation, scale: out.scale, order: "TRS"};
    },


    // --------------------------------------------------------------------------

    /**
     * Linearly interpolate the transform of a and b by alpha
     * @param a
     * @param b
     * @param alpha
     * @param out (If not provided, a new instance is created)
     */
    lerp(a: Readonly<Matrix4>, b: Readonly<Matrix4>, alpha: number, out: Matrix4 = gl_mat4.create()): Matrix4 {
        const m1 = this.decompose(a);
        const m2 = this.decompose(b);

        vec3.lerp(m1.translation, m2.translation, alpha, m1.translation);
        quat.slerp(m1.rotation, m2.rotation, alpha, m1.rotation);
        vec3.lerp(m1.scale, m2.scale, alpha, m1.scale);

        return this.compose(m1, out);
    },

    /**
     * Component-wise equality between a and b at the given tolerance
     * @param a
     * @param b
     * @param tolerance
     */
    equals(a: Readonly<Matrix4>, b: Readonly<Matrix4>, tolerance = 0.001): boolean {
        for (let i = 0; i < 16; i++) {
            if (!isNearlyEqual(a[i], b[i], tolerance))
                return false;
        }
        return true;
    },

    /**
     * Equality between the transform of a and b at the given tolerance
     * @param a
     * @param b
     * @param tolerance
     */
    transformEquals(a: Readonly<Matrix4>, b: Readonly<Matrix4>, tolerance = 0.001): boolean {
        const m1 = this.decompose(a);
        const m2 = this.decompose(b);
        return vec3.equals(m1.translation, m2.translation, tolerance)
            && quat.equals(m1.rotation, m2.rotation, tolerance)
            && vec3.equals(m1.scale, m2.scale, tolerance);
    },

    // ----------------------------------- Camera -------------------------------

    /**
     * Creates a perspective projection matrix
     * @param fov Field of view in degrees
     * @param aspect Aspect ratio (width / height)
     * @param near Near plane
     * @param far Far plane
     * @param out (If not provided, a new instance is created)
     */
    perspectiveProjection(fov: number, aspect: number, near: number, far: number, out: Matrix4 = gl_mat4.create()): Matrix4 {
        gl_mat4.identity(out);
        return gl_mat4.perspective(out, fov * toRad, aspect, near, far);
    },

    /**
     * Creates an orthographic projection matrix
     * @param left
     * @param right
     * @param bottom
     * @param top
     * @param near
     * @param far
     * @param out (If not provided, a new instance is created)
     */
    orthographicProjection(left: number, right: number, bottom: number, top: number, near: number, far: number, out: Matrix4 = gl_mat4.create()): Matrix4 {
        gl_mat4.identity(out);
        return gl_mat4.ortho(out, left, right, bottom, top, near, far);
    },

    /**
     * Creates a view matrix
     * @param position
     * @param target
     * @param up
     * @param out
     */
    lookAt(position: Readonly<Vector3>, target: Readonly<Vector3>, up: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.lookAt(out, vec3.toArray(position), vec3.toArray(target), vec3.toArray(up));
    },
};