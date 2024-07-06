/**
 * Provides getters and setters to access an array at an offset as a vector with x, y, z, w components
 */
export class RefVector {
    constructor(public arr: number[] | Float32Array, public offset: number = 0) {
    }

    get x(): number {
        return this.arr[this.offset];
    }

    set x(value: number) {
        this.arr[this.offset] = value;
    }

    get y(): number {
        return this.arr[this.offset + 1];
    }

    set y(value: number) {
        this.arr[this.offset + 1] = value;
    }

    get z(): number {
        return this.arr[this.offset + 2];
    }

    set z(value: number) {
        this.arr[this.offset + 2] = value;
    }

    get w(): number {
        return this.arr[this.offset + 3];
    }

    set w(value: number) {
        this.arr[this.offset + 3] = value;
    }
}

/**
 * Provides getters to access an array at an offset as a vector with x, y, z, w components
 */
export class ConstRefVector {
    constructor(public arr: number[] | Float32Array, public offset: number = 0) {
    }

    get x(): number {
        return this.arr[this.offset];
    }

    get y(): number {
        return this.arr[this.offset + 1];
    }

    get z(): number {
        return this.arr[this.offset + 2];
    }

    get w(): number {
        return this.arr[this.offset + 3];
    }
}