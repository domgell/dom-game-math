import {mat2d as gl_mat2x3} from "gl-matrix";
import {Vector2, vec2} from "./Vector2";
import {isNearlyEqual, lerp} from "./common.ts";
import {TransformOrder, mat4, Matrix4} from "./Matrix4.ts";
import {quat} from "./Quaternion.ts";

export type Matrix2x3 = gl_mat2x3

export type Transform2D = { translation: Vector2, rotation: number, scale: Vector2, order: TransformOrder }

export const mat2x3 = {

    // --------------------------------- Constants ---------------------------------

    idt: gl_mat2x3.create() as Matrix2x3,
    zero: new Float32Array(6) as Readonly<Matrix2x3>,


    // ---------------------------------- Creation ---------------------------------

    /**
     * Creates a new matrix from the given data.
     * @param data data to create the matrix from, if not provided creates a new identity matrix
     */
    new(data?: Float32Array | number[]): Matrix2x3 {
        if (data === undefined) {
            return gl_mat2x3.create() as Matrix2x3;
        } else {
            return data.slice(0, 6) as Matrix2x3;
        }
    },

    /**
     * Creates a new readonly matrix from the given data.
     * @param data data to create the matrix from, if not provided creates a new identity matrix
     */
    const(data?: Float32Array | number[]): Readonly<Matrix2x3> {
        return this.new(data);
    },

    /**
     * Sets the values of m to the values of other.
     * @param m
     * @param other
     */
    set(m: Matrix2x3, other: Readonly<Matrix2x3>): Matrix2x3 {
        return gl_mat2x3.copy(m, other);
    },

    /**
     * Sets the matrix to the identity matrix.
     * @param m
     */
    identity(m: Matrix2x3): Matrix2x3 {
        return gl_mat2x3.identity(m);
    },

    // ----------------------------------- Array -----------------------------------

    /**
     * Returns a matrix which references and can modify the given data
     * @param data
     * @param offset
     */
    ref(data: Float32Array, offset: number = 0) {
        return new Float32Array(data.buffer, offset * 4, 6);
    },

    /**
     * Returns a readonly matrix which references but cannot modify the given data
     * @param data
     * @param offset
     */
    refConst(data: Float32Array, offset: number = 0) {
        return this.ref(data, offset) as Readonly<Matrix2x3>;
    },

    /**
     * Copies the values of m into target at a given offset.
     * @param m
     * @param target
     * @param offset
     */
    intoArray(m: Readonly<Matrix2x3>, target: Float32Array | number[], offset: number = 0) {
        for (let i = 0; i < 6; i++) {
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
    mul(a: Readonly<Matrix2x3>, b: Readonly<Matrix2x3>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.multiply(out, a, b);
    },

    /**
     * Inverts m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    invert(m: Readonly<Matrix2x3>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.invert(out, m);
    },


    // -------------------------------- Translation ---------------------------------

    /**
     * Translates m by the given translation
     * @param m
     * @param translation
     * @param out (If not provided, a new instance is created)
     */
    translate(m: Readonly<Matrix2x3>, translation: Readonly<Vector2>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.translate(out, m, vec2.toArray(translation));
    },

    /**
     * Sets the translation of m to the given translation
     * @param m
     * @param translation
     * @param out (If not provided, a new instance is created)
     */
    setTranslation(m: Readonly<Matrix2x3>, translation: Readonly<Vector2>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        out[4] = translation.x;
        out[5] = translation.y;
        return out;
    },

    /**
     * Translation of m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    getTranslation(m: Readonly<Matrix2x3>, out: Vector2 = vec2.new()): Vector2 {
        out.x = m[4];
        out.y = m[5];
        return out;
    },

    /**
     * Creates a matrix with the given translation
     * @param translation
     * @param out (If not provided, a new instance is created)
     */
    fromTranslation(translation: Readonly<Vector2>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.fromTranslation(out, vec2.toArray(translation));
    },


    // ----------------------------------- Rotation -----------------------------------

    /**
     * Rotates m by the given rotation
     * @param m
     * @param rotation
     * @param out (If not provided, a new instance is created)
     */
    rotate(m: Readonly<Matrix2x3>, rotation: number, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.rotate(out, m, rotation);
    },

    /**
     * Sets the rotation of m to the given rotation
     * @param m
     * @param rotation
     * @param out (If not provided, a new instance is created)
     */
    setRotation(m: Readonly<Matrix2x3>, rotation: number, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        throw new Error("TODO");
    },

    /**
     * Rotation of m (without scale)
     * @param m
     */
    getRotation(m: Readonly<Matrix2x3>): number {
        return Math.atan2(m[1], m[0]);
    },

    /**
     * Creates a matrix with the given rotation
     * @param rotation
     * @param out (If not provided, a new instance is created)
     */
    fromRotation(rotation: number, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.fromRotation(out, rotation);
    },


    // --------------------------------- Scale ----------------------------------

    /**
     * Scales m by the given scale
     * @param m
     * @param scale
     * @param out (If not provided, a new instance is created)
     */
    scale(m: Readonly<Matrix2x3>, scale: Readonly<Vector2>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.scale(out, m, vec2.toArray(scale));
    },

    /**
     * Sets the scale of m to the given scale
     * @param m
     * @param scale
     * @param out (If not provided, a new instance is created)
     */
    setScale(m: Readonly<Matrix2x3>, scale: Readonly<Vector2>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        this.set(out, m);
        const current = this.getScale(m);
        vec2.div(scale, current, scale);
        this.scale(out, scale, out);
        return out;
    },

    /**
     * Scale of m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    getScale(m: Readonly<Matrix2x3>, out: Vector2 = vec2.new()): Vector2 {
        out.x = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
        out.y = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
        return out;
    },

    /**
     * Creates a matrix with the given scale
     * @param scale
     * @param out (If not provided, a new instance is created)
     */
    fromScale(scale: Readonly<Vector2>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        return gl_mat2x3.fromScaling(out, vec2.toArray(scale));
    },


    // ------------------------------- Transform --------------------------------

    /**
     * Creates a matrix from the given transform
     * @param transform (Default order is TRS)
     * @param out (If not provided, a new instance is created)
     */
    compose(transform: Partial<Transform2D>, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        transform.translation ??= vec2.zero;
        transform.rotation ??= 0;
        transform.scale ??= vec2.one;
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
     * Decomposes the given matrix into the given transform
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    decompose(m: Readonly<Matrix2x3>, out?: Partial<Transform2D>): Transform2D {
        out ??= {};

        out.translation ??= vec2.new();
        out.rotation ??= 0;
        out.scale ??= vec2.new(1);

        this.getTranslation(m, out.translation);
        out.rotation = this.getRotation(m);
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
    lerp(a: Readonly<Matrix2x3>, b: Readonly<Matrix2x3>, alpha: number, out: Matrix2x3 = gl_mat2x3.create()): Matrix2x3 {
        const m1 = this.decompose(a);
        const m2 = this.decompose(b);

        vec2.lerp(m1.translation, m2.translation, alpha, m1.translation);
        m1.rotation = lerp(m1.rotation, m2.rotation, alpha);
        vec2.lerp(m1.scale, m2.scale, alpha, m1.scale);

        return this.compose(m1, out);
    },

    /**
     * Component-wise equality between a and b at the given tolerance
     * @param a
     * @param b
     * @param tolerance
     */
    equals(a: Readonly<Matrix2x3>, b: Readonly<Matrix2x3>, tolerance: number = 0.001): boolean {
        for (let i = 0; i < 6; i++) {
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
    transformEquals(a: Readonly<Matrix2x3>, b: Readonly<Matrix2x3>, tolerance: number = 0.001): boolean {
        const m1 = this.decompose(a);
        const m2 = this.decompose(b);
        return vec2.equals(m1.translation, m2.translation, tolerance)
            && isNearlyEqual(m1.rotation, m2.rotation, tolerance)
            && vec2.equals(m1.scale, m2.scale, tolerance);
    },

    // ------------------------------- Conversion -----------------------------------

    /**
     * Creates a matrix4 from the given matrix2x3
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    toMat4(m: Readonly<Matrix2x3>, out: Matrix4 = mat4.new()): Matrix4 {
        const t = this.decompose(m);
        return mat4.compose({
            translation: {...t.translation, z: 0},
            rotation: quat.fromEuler({roll: t.rotation}),
            scale: {...t.scale, z: 1},
        }, out);
    },
};