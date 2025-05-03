import {
    vec2 as gl_vec2,
    vec3 as gl_vec3,
    vec4 as gl_vec4,
    mat4 as gl_mat4,
    mat3 as gl_mat3,
    quat as gl_quat,
} from "gl-matrix";
import {Matrix4} from "./Matrix4.ts";

export type Matrix3 = gl_mat3

export const mat3 = {

    // --------------------------------- Constants ---------------------------------

    /**
     * Zero matrix
     */
    zero: new Float32Array(9) as Readonly<Matrix3>,

    /**
     * Identity matrix
     */
    idt: gl_mat3.create() as Readonly<Matrix3>,


    // ---------------------------------- Creation ---------------------------------

    /**
     * Creates a new matrix from the given data.
     * @param data data to create the matrix from, if not provided creates a new identity matrix
     */
    new(data?: Float32Array | number[]): Matrix3 {
        if (data === undefined) {
            return gl_mat3.create();
        } else {
            return data.slice(0, 9) as Matrix3;
        }
    },

    /**
     * Creates a new readonly matrix from the given data.
     * @param data data to create the matrix from, if not provided creates a new identity matrix
     */
    const(data?: Float32Array | number[]): Readonly<Matrix3> {
        return this.new(data);
    },

    /**
     * Creates a new matrix with the same values as m.
     * @param m
     */
    copy(m: Readonly<Matrix3>): Matrix3 {
        return gl_mat3.clone(m);
    },

    /**
     * Sets the values of m to the values of other.
     * @param m
     * @param other
     */
    set(m: Matrix3, other: Readonly<Matrix3>): Matrix3 {
        return gl_mat3.copy(m, other);
    },

    /**
     * Sets the values of m to the identity matrix.
     * @param m
     */
    identity(m: Matrix3): Matrix3 {
        return gl_mat3.identity(m);
    },


    // ----------------------------------- Array -----------------------------------

    /**
     * Returns a matrix which references and can modify the given data
     * @param data
     * @param offset
     */
    ref(data: Float32Array, offset: number = 0) {
        return new Float32Array(data.buffer, offset * 4, 9);
    },

    /**
     * Returns a readonly matrix which references but cannot modify the given data
     * @param data
     * @param offset
     */
    refConst(data: Float32Array, offset: number = 0) {
        return this.ref(data, offset) as Readonly<Matrix3>;
    },

    /**
     * Copies the values of m into target at a given offset.
     * @param m
     * @param target
     * @param offset
     */
    intoArray(m: Readonly<Matrix3>, target: Float32Array | number[], offset: number = 0) {
        for (let i = 0; i < 9; i++) {
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
    mul(a: Readonly<Matrix3>, b: Readonly<Matrix3>, out: Matrix3 = gl_mat3.create()): Matrix3 {
        return gl_mat3.mul(out, a, b);
    },

    /**
     * Inverts m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    invert(m: Readonly<Matrix3>, out: Matrix3 = gl_mat3.create()): Matrix3 {
        return gl_mat3.invert(out, m);
    },

    /**
     * Transposes m
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    transpose(m: Readonly<Matrix3>, out: Matrix3 = gl_mat3.create()): Matrix3 {
        return gl_mat3.transpose(out, m);
    },


    // ------------------------------- Conversion -----------------------------------

    /**
     * Creates a matrix3 from the given matrix4
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    fromMat4(m: Readonly<Matrix4>, out: Matrix3 = gl_mat3.create()): Matrix3 {
        return gl_mat3.fromMat4(out, m);
    },

    /**
     * Creates a matrix4 from the given matrix3
     * @param m
     * @param out (If not provided, a new instance is created)
     */
    toMat4(m: Readonly<Matrix3>, out: Matrix4 = gl_mat4.create()): Matrix4 {
        out[0] = m[0];
        out[1] = m[1];
        out[2] = m[2];
        out[3] = 0;
        out[4] = m[3];
        out[5] = m[4];
        out[6] = m[5];
        out[7] = 0;
        out[8] = m[6];
        out[9] = m[7];
        out[10] = m[8];
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    },
};