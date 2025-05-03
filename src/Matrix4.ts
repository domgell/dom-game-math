import {mat4 as gl_mat4, quat as gl_quat, vec3 as gl_vec3} from "gl-matrix";
import {quat, Quaternion} from "./Quaternion.ts";
import {vec3, Vector3} from "./Vector3.ts";
import {isNearlyEqual, toRad} from "./common.ts";
import {DeepReadonly} from "@domgell/ts-util";
import {vec2, Vector2} from "./Vector2.ts";

// ------------------------------------ Transform3d ------------------------------------

/**
 * A 3D transform consisting of translation, rotation, scale and transform order
 */
export type Transform3D = { translation: Vector3, rotation: Quaternion, scale: Vector3, order: TransformOrder }

/**
 * The order in which to apply translation, rotation and scale transformations
 */
export type TransformOrder = "TRS" | "RTS" | "STR" | "SRT" | "RST" | "TSR"

/**
 * Creates a new transform instance with the copied properties of `t`.
 * @param t The transform to copy properties from
 * @param out The output transform, defaults to empty object
 * @returns The output transform with copied properties
 */
export function Transform3D(t: DeepReadonly<Partial<Transform3D>>, out: Partial<Transform3D> = {}): Transform3D {
    vec3.set(out.translation ??= vec3.new(), t.translation ?? vec3.zero);
    quat.set(out.rotation ??= quat.new(), t.rotation ?? quat.idt);
    vec3.set(out.scale ??= vec3.new(1), t.scale ?? vec3.one);
    out.order = t.order ?? "TRS";

    return out as Transform3D;
}

// ------------------------------------- Camera3d --------------------------------------

/**
 * A 3D camera with position, rotation and projection parameters
 */
export type Camera3D = {
    position: Vector3,
    rotation: Quaternion,
    fov: number,
    aspect: number,
    near: number,
    far: number,
}

/**
 * Creates a new camera instance with the copied properties of `t`.
 * @param t The camera to copy properties from
 * @param out The output camera, defaults to empty object
 * @returns The output camera with copied properties
 */
export function Camera3D(t: DeepReadonly<Partial<Camera3D>> & {
    aspect: number
}, out: Partial<Camera3D> = {}): Camera3D {
    vec3.set(out.position ??= vec3.new(), t.position ?? vec3.zero);
    quat.set(out.rotation ??= quat.new(), t.rotation ?? quat.idt);
    out.fov = t.fov ?? 45;
    out.aspect = t.aspect;
    out.near = t.near ?? 0.1;
    out.far = t.far ?? 1000;
    return out as Camera3D;
}

// ------------------------------------- Camera2d --------------------------------------

/**
 * A 2D camera with position, rotation, zoom and viewport parameters
 */
export type Camera2D = {
    position: Vector2,
    rotation: number,
    zoom: number,
    width: number,
    height: number,
}

/**
 * Creates a new 2D camera instance with the copied properties of `t`.
 * @param t The camera to copy properties from
 * @param out The output camera, defaults to empty object
 * @returns The output camera with copied properties
 */
export function Camera2D(t: DeepReadonly<Partial<Camera2D>> & {
    width: number,
    height: number
}, out: Partial<Camera2D> = {}): Camera2D {
    vec2.set(out.position ??= vec2.new(), t.position ?? vec2.zero);
    out.rotation = t.rotation ?? 0;
    out.zoom = t.zoom ?? 1;
    out.width = t.width;
    out.height = t.height;
    return out as Camera2D;
}

// -------------------------------------- Matrix4 --------------------------------------

/**
 * A 4x4 matrix type
 */
export type Matrix4 = gl_mat4

export const mat4 = {

    // --------------------------------- Constants ---------------------------------

    /**
     * Identity matrix
     */
    idt: gl_mat4.create() as Readonly<Matrix4>,

    /**
     * Zero matrix
     */
    zero: new Float32Array(16) as Readonly<Matrix4>,

    // ---------------------------------- Creation ---------------------------------

    /**
     * Creates a new matrix from the given data.
     * @param data Data to create the matrix from, if not provided creates a new identity matrix
     * @returns A new matrix
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
     * @param data Data to create the matrix from, if not provided creates a new identity matrix
     * @returns A new readonly matrix
     */
    const(data?: Float32Array | number[]): Readonly<Matrix4> {
        return this.new(data);
    },

    /**
     * Creates a new matrix with the same values as m.
     * @param m The matrix to copy
     * @returns A new matrix with copied values
     */
    copy(m: Readonly<Matrix4>): Matrix4 {
        return gl_mat4.clone(m);
    },

    /**
     * Sets the values of m to the values of other.
     * @param m The matrix to set
     * @param other The matrix to copy values from
     * @returns The matrix m with copied values
     */
    set(m: Matrix4, other: Readonly<Matrix4>): Matrix4 {
        return gl_mat4.copy(m, other);
    },

    /**
     * Sets the values of m to the identity matrix.
     * @param m The matrix to set
     * @returns The identity matrix
     */
    identity(m: Matrix4): Matrix4 {
        return gl_mat4.identity(m);
    },

    // ----------------------------------- Array -----------------------------------

    /**
     * Returns a matrix which references and can modify the given data
     * @param data The data array to reference
     * @param offset The offset in the array, defaults to 0
     * @returns A matrix referencing the data
     */
    ref(data: Float32Array, offset: number = 0) {
        return new Float32Array(data.buffer, offset * 4, 16);
    },

    /**
     * Returns a readonly matrix which references but cannot modify the given data
     * @param data The data array to reference
     * @param offset The offset in the array, defaults to 0
     * @returns A readonly matrix referencing the data
     */
    refConst(data: Float32Array, offset: number = 0) {
        return this.ref(data, offset) as Readonly<Matrix4>;
    },

    /**
     * Copies the values of m into target at a given offset.
     * @param m The matrix to copy
     * @param target The target array
     * @param offset The offset in the target array, defaults to 0
     */
    intoArray(m: Readonly<Matrix4>, target: Float32Array | number[], offset: number = 0) {
        for (let i = 0; i < 16; i++) {
            target[offset + i] = m[i];
        }
    },

    // ------------------------------- Operations -----------------------------------

    /**
     * Multiply `a` and `b`, put the result in `out` and return `out`.
     * @param a The first matrix
     * @param b The second matrix
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the multiplication result
     */
    mul(a: Readonly<Matrix4>, b: Readonly<Matrix4>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.mul(out, a, b);
    },

    /**
     * Invert `m`, put the result in `out` and return `out`.
     * @param m The matrix to invert
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the inversion result
     */
    invert(m: Readonly<Matrix4>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.invert(out, m);
    },

    /**
     * Transpose `m`, put the result in `out` and return `out`.
     * @param m The matrix to transpose
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the transposition result
     */
    transpose(m: Readonly<Matrix4>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.transpose(out, m);
    },

    // -------------------------------- Translation ---------------------------------

    /**
     * Translate `m` by `translation`, put the result in `out` and return `out`.
     * @param m The matrix to translate
     * @param translation The translation vector
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the translation applied
     */
    translate(m: Readonly<Matrix4>, translation: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.translate(out, m, vec3.toArray(translation));
    },

    /**
     * Set the translation of `m` to `translation`, put the result in `out` and return `out`.
     * @param m The matrix to set translation for
     * @param translation The translation vector
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the new translation
     */
    setTranslation(m: Readonly<Matrix4>, translation: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        this.set(out, m);
        out[12] = translation.x;
        out[13] = translation.y;
        out[14] = translation.z;
        return out;
    },

    /**
     * Get the translation of `m`, put the result in `out` and return `out`.
     * @param m The matrix to get translation from
     * @param out The output vector, defaults to a new vector
     * @returns The output vector with the translation
     */
    getTranslation(m: Readonly<Matrix4>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        out.x = m[12];
        out.y = m[13];
        out.z = m[14];
        return out;
    },

    /**
     * Creates a matrix with the given translation, put the result in `out` and return `out`.
     * @param translation The translation vector
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the translation
     */
    fromTranslation(translation: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.fromTranslation(out, vec3.toArray(translation));
    },

    // ---------------------------------- Rotation ----------------------------------

    /**
     * Rotate `m` by `rotation`, put the result in `out` and return `out`.
     * @param m The matrix to rotate
     * @param rotation The rotation quaternion
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the rotation applied
     */
    rotate(m: Readonly<Matrix4>, rotation: Readonly<Quaternion>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        const rot = gl_mat4.fromQuat(gl_mat4.create(), quat.toArray(rotation));
        return gl_mat4.mul(out, m, rot);
    },

    /**
     * Set the rotation of `m` to `rotation`, put the result in `out` and return `out`.
     * @param m The matrix to set rotation for
     * @param rotation The rotation quaternion
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the new rotation
     */
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
     * Get the normalized rotation of `m` (without scale), put the result in `out` and return `out`.
     * @param m The matrix to get rotation from
     * @param out The output quaternion, defaults to a new quaternion
     * @returns The output quaternion with the rotation
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
     * Get the rotation of `m` without removing scale, put the result in `out` and return `out`.
     * @param m The matrix to get rotation from
     * @param out The output quaternion, defaults to a new quaternion
     * @returns The output quaternion with the rotation
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
     * Creates a matrix with the given rotation, put the result in `out` and return `out`.
     * @param rotation The rotation quaternion
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the rotation
     */
    fromRotation(rotation: Readonly<Quaternion>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        this.identity(out);
        return this.rotate(out, rotation, out);
    },

    // --------------------------------- Scale ----------------------------------

    /**
     * Scale `m` by `scale`, put the result in `out` and return `out`.
     * @param m The matrix to scale
     * @param scale The scale vector
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the scale applied
     */
    scale(m: Readonly<Matrix4>, scale: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.scale(out, m, vec3.toArray(scale));
    },

    /**
     * Set the scale of `m` to `scale`, put the result in `out` and return `out`.
     * @param m The matrix to set scale for
     * @param scale The scale vector
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the new scale
     */
    setScale(m: Readonly<Matrix4>, scale: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        this.set(out, m);
        const current = this.getScale(m);
        vec3.div(scale, current, current);
        this.scale(out, current, out);

        return out;
    },

    /**
     * Get the scale of `m`, put the result in `out` and return `out`.
     * @param m The matrix to get scale from
     * @param out The output vector, defaults to a new vector
     * @returns The output vector with the scale
     */
    getScale(m: Readonly<Matrix4>, out: Vector3 = {x: 0, y: 0, z: 0}): Vector3 {
        const scale = gl_mat4.getScaling(gl_vec3.create(), m);
        out.x = scale[0];
        out.y = scale[1];
        out.z = scale[2];
        return out;
    },

    /**
     * Creates a matrix with the given scale, put the result in `out` and return `out`.
     * @param scale The scale vector
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the scale
     */
    fromScale(scale: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.fromScaling(out, vec3.toArray(scale));
    },

    // ------------------------------- Transform --------------------------------

    /**
     * Creates a matrix from the given transform, put the result in `out` and return `out`.
     * @param transform The transform to create matrix from (Default order is TRS)
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the transform
     */
    compose(transform: Partial<Transform3D>, out: Matrix4 = gl_mat4.create()): Matrix4 {
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
     * Decompose `m` into a transform, put the result in `out` and return `out`.
     * @param m The matrix to decompose
     * @param out The output transform, defaults to an empty object
     * @returns The output transform with the decomposition
     */
    decompose(m: Readonly<Matrix4>, out: Partial<Transform3D> = {}): Transform3D {
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
     * Linearly interpolate the transform of `a` and `b` by `alpha`, put the result in `out` and return `out`.
     * @param a The first matrix
     * @param b The second matrix
     * @param alpha The interpolation factor
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the interpolation result
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
     * Component-wise equality between `a` and `b` at the given tolerance.
     * @param a The first matrix
     * @param b The second matrix
     * @param tolerance The equality tolerance, defaults to 0.001
     * @returns True if the matrices are equal within tolerance
     */
    equals(a: Readonly<Matrix4>, b: Readonly<Matrix4>, tolerance = 0.001): boolean {
        for (let i = 0; i < 16; i++) {
            if (!isNearlyEqual(a[i], b[i], tolerance))
                return false;
        }
        return true;
    },

    /**
     * Component-wise equality between the transforms of `a` and `b` at the given tolerance.
     * @param a The first matrix
     * @param b The second matrix
     * @param tolerance The equality tolerance, defaults to 0.001
     * @returns True if the transforms are equal within tolerance
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
     * Creates a perspective projection matrix, put the result in `out` and return `out`.
     * @param fov Field of view in degrees
     * @param aspect Aspect ratio (width / height)
     * @param near Near plane
     * @param far Far plane
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the perspective projection
     */
    perspectiveProjection(fov: number, aspect: number, near: number, far: number, out: Matrix4 = gl_mat4.create()): Matrix4 {
        gl_mat4.identity(out);
        return gl_mat4.perspective(out, fov * toRad, aspect, near, far);
    },

    /**
     * Creates an orthographic projection matrix, put the result in `out` and return `out`.
     * @param left Left plane
     * @param right Right plane
     * @param bottom Bottom plane
     * @param top Top plane
     * @param near Near plane
     * @param far Far plane
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the orthographic projection
     */
    orthographicProjection(left: number, right: number, bottom: number, top: number, near: number, far: number, out: Matrix4 = gl_mat4.create()): Matrix4 {
        gl_mat4.identity(out);
        return gl_mat4.ortho(out, left, right, bottom, top, near, far);
    },

    /**
     * Creates a view matrix, put the result in `out` and return `out`.
     * @param position Camera position
     * @param target Camera target
     * @param up Camera up vector
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the view transformation
     */
    lookAt(position: Readonly<Vector3>, target: Readonly<Vector3>, up: Readonly<Vector3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        return gl_mat4.lookAt(out, vec3.toArray(position), vec3.toArray(target), vec3.toArray(up));
    },

    /**
     * Creates a 3D, first person, view projection matrix, put the result in `out` and return `out`.
     * @param camera The camera parameters, defaults to `{position: vec3.zero, rotation: quat.idt, fov: 45, near: 0.1, far: 1000}`
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the view projection
     */
    viewProjection3d(camera: DeepReadonly<Partial<Camera3D>> & {
        aspect: number
    }, out: Matrix4 = gl_mat4.create()): Matrix4 {
        const fwd = vec3.rotate(vec3.forward, camera.rotation ?? quat.idt);
        vec3.normalize(fwd, fwd);
        const up = vec3.rotate(vec3.up, camera.rotation ?? quat.idt);
        vec3.negate(up, up);
        vec3.normalize(up, up);
        const view = mat4.lookAt(camera.position!, vec3.add(camera.position ?? vec3.zero, fwd), up);
        const proj = mat4.perspectiveProjection(camera.fov ?? 45, camera.aspect, camera.near ?? 0.1, camera.far ?? 1000);
        return mat4.mul(proj, view, out);
    },

    /**
     * Creates a 2D, top down, view projection matrix, put the result in `out` and return `out`.
     * @param camera The camera parameters, defaults to `{position: vec2.zero, rotation: 0, zoom: 1}`
     * @param out The output matrix, defaults to a new identity matrix
     * @returns The output matrix with the view projection
     */
    viewProjection2d(camera: DeepReadonly<Partial<Camera2D>> & {
        width: number,
        height: number
    }, out: Matrix4 = gl_mat4.create()): Matrix4 {
        const view = mat4.new();
        mat4.translate(out, vec3.new(camera.position ?? vec2.zero, 0), view);
        mat4.rotate(out, quat.fromEuler({roll: camera.rotation ?? 0}), view);

        const proj = mat4.new();
        const aspect = camera.height / camera.width;
        const zoom = camera.zoom ?? 1;
        const left = -1 / zoom;
        const right = 1 / zoom;
        const bottom = zoom * aspect;
        const top = zoom * aspect;
        mat4.orthographicProjection(left, right, top, bottom, -1, 1, proj);

        return mat4.mul(proj, view, out);
    },
};