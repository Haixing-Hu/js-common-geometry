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
 * 判断两个浮点数是否相等。
 *
 * @param {number} x
 *     第一个浮点数。
 * @param {number} y
 *     第二个浮点数。
 * @returns {boolean}
 *     如果两个浮点数相等，则返回`true`；否则返回`false`。
 */
function eq(x, y) {
  return Math.abs(x - y) <= Config.EPS;
}

/**
 * 判断一个浮点数是否小于另一个浮点数。
 *
 * @param {number} x
 *     第一个浮点数。
 * @param {number} y
 *     第二个浮点数。
 * @returns {boolean}
 *     若第一个浮点数小于第二个浮点数，则返回`true`；否则返回`false`。
 */
function lt(x, y) {
  return x < y + Config.EPS;
}

/**
 * 判断一个浮点数是否小于或等于另一个浮点数。
 *
 * @param {number} x
 *     第一个浮点数。
 * @param {number} y
 *     第二个浮点数。
 * @returns {boolean}
 *     若第一个浮点数小于或等于第二个浮点数，则返回`true`；否则返回`false`。
 */
function leq(x, y) {
  return x <= y + Config.EPS;
}

/**
 * 判断一个浮点数是否大于另一个浮点数。
 *
 * @param {number} x
 *     第一个浮点数。
 * @param {number} y
 *     第二个浮点数。
 * @returns {boolean}
 *     若第一个浮点数大于第二个浮点数，则返回`true`；否则返回`false`。
 */
function gt(x, y) {
  return x + Config.EPS > y;
}

/**
 * 判断一个浮点数是否大于或等于另一个浮点数。
 *
 * @param {number} x
 *     第一个浮点数。
 * @param {number} y
 *     第二个浮点数。
 * @returns {boolean}
 *     若第一个浮点数大于或等于第二个浮点数，则返回`true`；否则返回`false`。
 */
function geq(x, y) {
  return x + Config.EPS >= y;
}

/**
 * 判定一个浮点数的绝对值是否足够小以至于可以被认为是0.
 *
 * @param {number} x
 *     待判定的浮点数。
 * @returns {boolean}
 *     若浮点数的绝对值是否足够小以至于可以被认为是0，则返回`true`；否则返回`false`。
 */
function isZero(x) {
  return Math.abs(x) <= Config.EPS;
}

/**
 * 判定一个浮点数的绝对值是否足够大以至于可以被认为是非0.
 *
 * @param {number} x
 *     待判定的浮点数。
 * @returns {boolean}
 *     若浮点数的绝对值是否足够大以至于可以被认为是非0，则返回`true`；否则返回`false`。
 */
function isNonZero(x) {
  return Math.abs(x) > Config.EPS;
}

/**
 * 判定一个浮点数的值足够小以至于可以被认为小于等于0.
 *
 * @param {number} x
 *     待判定的浮点数。
 * @returns {boolean}
 *     若浮点数的值足够小以至于可以被认为小于等于0, i.e., `x <= 0`; 则返回`true`；否则返回`false`。
 */
function isNonPositive(x) {
  return x <= Config.EPS;
}

export {
  eq,
  lt,
  leq,
  gt,
  geq,
  isZero,
  isNonZero,
  isNonPositive,
}
