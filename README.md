# dom-game-math
A convenient gl-matrix wrapper written in typescript.

# Vectors

```typescript
// Vector arithmetic
const a = vec3.new(1, 2, 3);
const b = vec3.new(4, 5, 6);
const c = vec3.add(a, b); // The last parameter is an optional 'out' parameter

// Vectors are just JS objects
const v1 = vec3.new(1, 2, 3);
const v2 = {x: 1, y: 2, z: 3}; // Equivalent to v1

v1.z = 2;
v1.y = 3;
v1.x = 4;
const vector4 = {...v1, w: 1};

// All types have ways to create immutable instances
const purple = vec4.const(1, 0, 1, 1); // Readonly<Vector4> with Object.freeze()
const directions = [vec3.up, vec3.forward, vec3.right] // Predefined immutable vectors

```

# Matrices

```typescript
// Convenient ways to create transformation matrices
const translation = mat4.fromTranslation(vec3.new(0, 5, 0));
const scale = mat4.fromScale(vec3.new(5));
const a = mat4.mul(translation, scale);
const b = mat4.compose({translation: vec3.new(0, 5, 0), scale: vec3.new(5)}); // Equivalent to a

// Provides common game-related matrix operations
const proj = mat4.perspectiveProjection(65, 800 / 400, 0.1, 100);
const view = mat4.lookAt(vec3.new(0, 5, 0), vec3.zero, vec3.up);
const camera = mat4.mul(proj, view);

// Access chunks of arrays as matrices without creating copies
const data = new Float32Array(64);
const mutable = mat4.ref(data, 16) // Reference to data[16] - data[31]
const immutable = mat4.refConst(data) // Immutable reference to data[0] - data[15]
mat4.translate(immutable, vec3.new(1, 2, 3), mutable); // Result is stored in the original array

```

# Quaternions

```typescript
// Create quaternions from euler angles or axis-angle
const q1 = quat.fromEuler({yaw: 45, pitch: 90, order: "YawPitchRoll"}); // 'Order' is optional
const q2 = quat.fromAxisAngle(vec3.new(1, 0, 0), 45);

// Quaternions are also just JS objects
const a = quat.new(0, 0, 0, 0)
a.w = 1;

const b = {...a};
```