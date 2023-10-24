////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

/**
 * The global configuration of the library.
 *
 * @type {object}
 */
const Config = {
  /**
   * A floating point number representing the positive infinity value.
   *
   * Note that this value CANNOT be `Number.MAX_VALUE` nor `Number.INFINITY`,
   * since this value may be involved in arithmetic operations, and using
   * `Number.MAX_VALUE` or `Number.INFINITY` would cause an overflow.
   */
  POSITIVE_INF: 1e20,

  /**
   * A floating point number representing the negative infinity value.
   *
   * Note that this value CANNOT be `Number.MAX_VALUE` nor `Number.INFINITY`,
   * since this value may be involved in arithmetic operations, and using
   * `Number.MAX_VALUE` or `Number.INFINITY` would cause an overflow.
   */
  NEGATIVE_INF: -1e20,

  /**
   * The precision when comparing floating point numbers. If the difference
   * between two floating point numbers is less than this precision, then they
   * are considered equal.
   */
  EPS: 1e-8,

  /**
   * The default direction of Y-axis.
   *
   * This setting may have the following values:
   * - 'up': indicates that the Y-axis is oriented upwards.
   * - 'down': indicates that the Y-axis is oriented downwards. When using
   *    the screen coordinate system, the Y-axis is oriented downwards.
   *
   * @type {string}
   */
  Y_AXIS_DIRECTION: 'up',
};

export default Config;
