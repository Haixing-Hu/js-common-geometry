/******************************************************************************
 *                                                                            *
 *    Copyright (c) 2023.                                                     *
 *    Haixing Hu                                                              *
 *                                                                            *
 *    All rights reserved.                                                    *
 *                                                                            *
 ******************************************************************************/
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

export {
  eq,
  neq,
  lt,
  leq,
  gt,
  geq,
  isZero,
  isNonZero,
  isNonPositive,
}
