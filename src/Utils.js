////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import Config from './Config';

/**
 * Determine if two floating-point numbers are equal.
 *
 * @param {number} x
 *     The first floating-point number.
 * @param {number} y
 *     The second floating-point number.
 * @returns {boolean}
 *     Returns `true` if the two floating-point numbers are equal; otherwise,
 *     returns `false`.
 */
function eq(x, y) {
  return Math.abs(x - y) <= Config.EPS;
}

/**
 * Determine if two floating-point numbers are not equal.
 *
 * @param {number} x
 *     The first floating-point number.
 * @param {number} y
 *     The second floating-point number.
 * @returns {boolean}
 *     Returns `true` if the two floating-point numbers are not equal; otherwise,
 *     returns `false`.
 */
function neq(x, y) {
  return Math.abs(x - y) > Config.EPS;
}

/**
 * Determine if a floating-point number is less than another floating-point
 * number.
 *
 * @param {number} x
 *     The first floating-point number.
 * @param {number} y
 *     The second floating-point number.
 * @returns {boolean}
 *     Returns `true` if the first floating-point number is less than the second
 *     floating-point number; otherwise, returns `false`.
 */
function lt(x, y) {
  return x < y + Config.EPS;
}

/**
 * Determine if a floating-point number is less than or equal to another
 * floating-point number.
 *
 * @param {number} x
 *     The first floating-point number.
 * @param {number} y
 *     The second floating-point number.
 * @returns {boolean}
 *     Returns `true` if the first floating-point number is less than or equal
 *     to the second floating-point number; otherwise, returns `false`.
 */
function leq(x, y) {
  return x <= y + Config.EPS;
}

/**
 * Determine if a floating-point number is greater than another floating-point
 * number.
 *
 * @param {number} x
 *     The first floating-point number.
 * @param {number} y
 *     The second floating-point number.
 * @returns {boolean}
 *     Returns `true` if the first floating-point number is greater than the
 *     second floating-point number; otherwise, returns `false`.
 */
function gt(x, y) {
  return x + Config.EPS > y;
}

/**
 * Determine if a floating-point number is greater than or equal to another
 * floating-point number.
 *
 * @param {number} x
 *     The first floating-point number.
 * @param {number} y
 *     The second floating-point number.
 * @returns {boolean}
 *     Returns `true` if the first floating-point number is greater than or
 *     equal to the second floating-point number; otherwise, returns `false`.
 */
function geq(x, y) {
  return x + Config.EPS >= y;
}

/**
 * Determine if the absolute value of a floating-point number is small enough
 * to be considered as zero.
 *
 * @param {number} x
 *     The floating-point number to be determined.
 * @returns {boolean}
 *     Returns `true` if the absolute value of the floating-point number is
 *     small enough to be considered as zero; otherwise, returns `false`.
 */
function isZero(x) {
  return Math.abs(x) <= Config.EPS;
}

/**
 * Determine if the absolute value of a floating-point number is large enough
 * to be considered as non-zero.
 *
 * @param {number} x
 *     The floating-point number to be determined.
 * @returns {boolean}
 *     Returns `true` if the absolute value of the floating-point number is
 *     large enough to be considered as non-zero; otherwise, returns `false`.
 */
function isNonZero(x) {
  return Math.abs(x) > Config.EPS;
}

/**
 * Determine if the value of a floating-point number is greater enough to be
 * considered as greater than zero.
 *
 * @param {number} x
 *     The floating-point number to be determined.
 * @returns {boolean}
 *     Returns `true` if the value of the floating-point number is greater enough
 *     to be considered as greater than zero (i.e., `x > 0`); otherwise, returns
 *     `false`.
 */
function isPositive(x) {
  return x > Config.EPS;
}

/**
 * Determine if the value of a floating-point number is small enough to be
 * considered as less than zero.
 *
 * @param {number} x
 *     The floating-point number to be determined.
 * @returns {boolean}
 *     Returns `true` if the value of the floating-point number is small enough
 *     to be considered as less than zero (i.e., `x < 0`); otherwise, returns
 *     `false`.
 */
function isNegative(x) {
  return x < -Config.EPS;
}

/**
 * Determine if the value of a floating-point number is small enough to be
 * considered as less than or equal to zero.
 *
 * @param {number} x
 *     The floating-point number to be determined.
 * @returns {boolean}
 *     Returns `true` if the value of the floating-point number is small enough
 *     to be considered as less than or equal to zero (i.e., `x <= 0`);
 *     otherwise, returns `false`.
 */
function isNonPositive(x) {
  return x <= Config.EPS;
}

/**
 * Determine if the value of a floating-point number is greater enough to be
 * considered as greater than or equal to zero.
 *
 * @param {number} x
 *     The floating-point number to be determined.
 * @returns {boolean}
 *     Returns `true` if the value of the floating-point number is greater enough
 *     to be considered as greater than or equal to zero (i.e., `x >= 0`);
 *     otherwise, returns `false`.
 */
function isNonNegative(x) {
  return x >= Config.EPS;
}

/**
 * Determinate the sign of a floating-point number. If the absolute value of the
 * number is small enough to be considered as zero, then the sign of the number
 * is considered as zero.
 *
 * Note that `Math.sign(x)` do not return zero even if the absolute value of `x`
 * is small enough to be considered as zero.
 *
 * @param {number} x
 *     The floating-point number to be determined.
 */
function sign(x) {
  if (isZero(x)) {
    return 0;
  } else if (x < 0) {
    return -1;
  } else {
    return +1;
  }
}

/**
 * Tests whether a list of vertexes is clockwise.
 *
 * @param {Point[]} vertexes
 *     a list of vertexes of a polygon, which could be either clockwise or
 *     counter-clockwise.
 * @return {boolean}
 *    Returns `true` if the list of vertexes is clockwise; otherwise, returns
 *    `false`.
 */
function isClockwise(vertexes) {
  if (vertexes.length < 3) {
    return false;
  }
  const u = vertexes[0].subtract(vertexes[1]);
  const v = vertexes[2].subtract(vertexes[1]);
  return isNegative(u.cross(v));
}

/**
 * Make a list of vertexes clockwise.
 *
 * @param {Point[]} vertexes
 *    a list of vertexes of a polygon, which could be either clockwise or
 *    counter-clockwise.
 * @return {Point[]}
 *    Returns a list of vertexes of a polygon, which is clockwise.
 */
function makeClockwise(vertexes) {
  if (isClockwise(vertexes)) {
    return vertexes.slice();
  } else {
    return vertexes.slice().reverse();
  }
}

/**
 * Find the top-left vertex of a list of vertexes.
 *
 * @param {Point[]} vertexes
 *    a list of vertexes of a polygon.
 * @return {number}
 *    Returns the index of the top-left vertex of the polygon. The top-left vertex
 *    is the vertex with the largest or smallest y-coordinate (depending on the
 *    direction of the y-axis, i.e., `Config.Y_AXIS_DIRECTION === 'up'` or
 *    `Config.Y_AXIS_DIRECTION === 'down'`), and among all the vertexes with
 *    the same y-coordinate, the one with the smallest x-coordinate.
 */
function findTopLeftIndex(vertexes) {
  let topLeftIndex = 0;
  let topLeft = vertexes[0];
  if (Config.Y_AXIS_DIRECTION === 'up') {
    for (let i = 1; i < vertexes.length; i++) {
      const v = vertexes[i];
      if (gt(v.y, topLeft.y) || (eq(v.y, topLeft.y) && lt(v.x, topLeft.x))) {
        topLeft = v;
        topLeftIndex = i;
      }
    }
  } else {
    for (let i = 1; i < vertexes.length; i++) {
      const v = vertexes[i];
      if (lt(v.y, topLeft.y) || (eq(v.y, topLeft.y) && lt(v.x, topLeft.x))) {
        topLeft = v;
        topLeftIndex = i;
      }
    }
  }
  return topLeftIndex;
}

/**
 * Normalizes a list of vertexes.
 *
 * @param {Point[]} vertexes
 *    a list of vertexes of a polygon, which may be either clockwise or
 *    counter-clockwise.
 * @return {Point[]}
 *    Returns a list of vertexes of a polygon, which is clockwise and the
 *    top-left vertex is the first vertex.
 */
function normalize(vertexes) {
  const v = makeClockwise(vertexes);
  const topLeftIndex = findTopLeftIndex(v);
  const n = v.length;
  const result = [];
  for (let i = 0; i < n; ++i) {
    const j = (topLeftIndex + i) % n;
    result.push(v[j]);
  }
  return result;
}

/**
 * Calculates the boundaries of a list of vertexes.
 *
 * Note that the y-coordinate of the top boundary depends on the direction of
 * the y-axis, i.e., if `Config.Y_AXIS_DIRECTION === 'up'` then the y-coordinate
 * of the top boundary is the largest y-coordinate of the vertexes; otherwise,
 * the y-coordinate of the top boundary is the smallest y-coordinate of the
 * vertexes.
 *
 * @param {Point[]} vertexes
 *     a list of vertexes of a polygon.
 * @return {{left: number, right: number, top: number, bottom: number}}
 *     Returns an object with the following properties:
 *     - `left`: the x-coordinate of the left boundary.
 *     - `right`: the x-coordinate of the right boundary.
 *     - `top`: the y-coordinate of the top boundary.
 *     - `bottom`: the y-coordinate of the bottom boundary.
 */
function calculateBoundaries(vertexes) {
  let min_x = Number.POSITIVE_INFINITY;
  let max_x = Number.NEGATIVE_INFINITY;
  let min_y = Number.POSITIVE_INFINITY;
  let max_y = Number.NEGATIVE_INFINITY;
  for (const v of vertexes) {
    min_x = Math.min(min_x, v.x);
    max_x = Math.max(max_x, v.x);
    min_y = Math.min(min_y, v.y);
    max_y = Math.max(max_y, v.y);
  }
  const result = {};
  result.left = min_x;
  result.right = max_x;
  if (Config.Y_AXIS_DIRECTION === 'up') {
    result.top = max_y;
    result.bottom = min_y;
  } else {
    result.top = min_y;
    result.bottom = max_y;
  }
  return result;
}

/**
 * Calculates the modulo of a number.
 *
 * Modulo is defined as `k := x - n * q` where `q` is the integer such that `k`
 * has the same sign as the divisor n while being as close to 0 as possible.
 *
 * @param {number} x
 *    The number to be taken the modulo.
 * @param {number} n
 *    The divisor.
 * @return {number}
 *    Returns the modulo of `x` with respect to `n`. The returned value is always
 *    non-negative.
 */
function modulo(x, n) {
  return ((x % n) + n) % n;
}

export {
  eq,
  neq,
  lt,
  leq,
  gt,
  geq,
  isZero,
  isNonZero,
  isPositive,
  isNegative,
  isNonPositive,
  isNonNegative,
  sign,
  isClockwise,
  makeClockwise,
  findTopLeftIndex,
  normalize,
  calculateBoundaries,
  modulo,
};
