/******************************************************************************
 *                                                                            *
 *    Copyright (c) 2023.                                                     *
 *    Haixing Hu                                                              *
 *                                                                            *
 *    All rights reserved.                                                    *
 *                                                                            *
 ******************************************************************************/
import Point from './Point';
import Line from './Line';
import { calculateBoundaries, isZero, normalize, modulo } from './Utils';

/**
 * This class represents a polygon in a plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Polygon {
  /**
   * Tests whether the specified vertexes can form a valid polygon.
   *
   * @param {Point[]} vertexes
   *    the array of vertexes to test.
   * @returns {boolean}
   *    `true` if the specified vertexes can form a valid polygon; `false`
   *    otherwise.
   */
  static isValid(vertexes) {
    if (!Array.isArray(vertexes)) {
      return false;
    }
    if (vertexes.length < 3) {
      return false;
    }
    const n = vertexes.length;
    for (let i = 1; i < n; ++i) {
      const v0 = vertexes[i - 1];
      const v1 = vertexes[i];
      const v2 = vertexes[(i + 1) % n];
      if (isZero(v1.times(v0, v2))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Constructs a polygon.
   *
   * The constructor must be provided with vertexes of a polygon. The vertexes
   * could be in clockwise order or counter-clockwise order, but they must form
   * a valid polygon, i.e., they should have at least 3 vertexes and no three
   * consecutive vertexes should be in the same line.
   *
   * The constructor will normalize the vertexes, that is, it will reorder the
   * vertexes in the clockwise order, and select the top-left vertex as the
   * first vertex.
   *
   * The top-left vertex is the vertex with the largest or smallest y-coordinate
   * (depending on the direction of the y-axis, i.e.,
   * `Config.Y_AXIS_DIRECTION === 'up'` or `Config.Y_AXIS_DIRECTION === 'down'`),
   * and among all the vertexes with the same y-coordinate, the one with the
   * smallest x-coordinate.
   *
   * @param {Point[]} vertexes
   *     the array of vertexes of the polygon, which must have at least 3
   *     points and no 3 consecutive points should be in the same line.
   * @param {boolean} normalized
   *     Indicates whether the specified vertexes are normalized. If the
   *     specified vertexes are normalized, they will be copied to the new
   *     polygon; otherwise, they will be normalized and then copied to the
   *     new polygon. The default value of this argument is `false`.
   * @throws {Error}
   *     if the array of vertexes has less than 3 points.
   */
  constructor(vertexes, normalized = false) {
    if (normalized) {
      this.vertexes = vertexes.slice();
    } else {
      if (!Polygon.isValid(vertexes)) {
        throw new Error('The vertexes cannot form a valid polygon.');
      }
      this.vertexes = normalize(vertexes);
    }
    // calculate the boundaries
    const boundary = calculateBoundaries(this.vertexes);
    this.left = boundary.left;
    this.right = boundary.right;
    this.top = boundary.top;
    this.bottom = boundary.bottom;
    Object.freeze(this);        //  make this object immutable
  }

  /**
   * Gets the array of sides of this polygon.
   *
   * @return {Line[]}
   *    the array of sides of this polygon.
   */
  sides() {
    const n = this.vertexes.length;
    return this.vertexes.map((p, i) => new Line(p, this.vertexes[(i + 1) % n]));
  }

  /**
   * Gets the array of angles of this polygon.
   *
   * @return {number[]}
   *    the array of angles of this polygon, in radians.
   */
  angles() {
    const n = this.vertexes.length;
    return this.vertexes.map((p, i) => {
      const p0 = this.vertexes[(i + n - 1) % n];
      const p1 = this.vertexes[(i + 1) % n];
      const u = p0.subtract(p);
      const v = p1.subtract(p);
      return u.angleWith(v);
    });
  }

  /**
   * Gets the specified vertex of this polygon.
   *
   * @param {number} i
   *     the index of the specified vertex to get. If this index is larger
   *     than or equal to the number of vertexes of this polygon, it will be
   *     treated as module the number of vertexes.
   * @returns {Point}
   *     the specified vertex of this polygon.
   */
  vertex(i) {
    const n = this.vertexes.length;
    return this.vertexes[modulo(i, n)];
  }

  /**
   * Gets the specified side of this polygon.
   *
   * @param {number} i
   *     the index of the specified side to get. If this index is larger
   *     than or equal to the number of sides of this polygon, it will be
   *     treated as module the number of sides.
   * @return {Line}
   *     the specified side of this polygon.
   */
  side(i) {
    const n = this.vertexes.length;
    const u = this.vertexes[modulo(i, n)];
    const v = this.vertexes[modulo(i + 1, n)];
    return new Line(u, v);
  }

  /**
   * Gets the specified angle of this polygon.
   *
   * @param {number} i
   *     the index of the specified side to get. If this index is larger
   *     than or equal to the number of sides of this polygon, it will be
   *     treated as module the number of sides.
   * @return {number}
   *     the specified angle of this polygon, in radians.
   */
  angle(i) {
    const n = this.vertexes.length;
    const p0 = this.vertexes[modulo(i - 1, n)];
    const p = this.vertexes[modulo(i, n)];
    const p1 = this.vertexes[modulo(i + 1, n)];
    const u = p0.subtract(p);
    const v = p1.subtract(p);
    return u.angleWith(v);
  }

  /**
   * Calculates the area of this polygon.
   *
   * @return {number}
   *    the area of this polygon.
   */
  area() {
    const n = this.vertexes.length;
    if (n < 3) {
      return 0;
    }
    let result = 0;
    for (let i = 0; i < n; ++i) {
      const p = this.vertexes[i];
      const q = this.vertexes[(i + 1) % n];
      result += p.x * q.y;
      result -= p.y * q.x;
    }
    return Math.abs(result / 2.0);
  }

  /**
   * Calculate the center or centroid of this polygon, applicable to any simple
   * polygon.
   *
   * The center of a polygon is the arithmetic mean ("average") of all points of
   * the polygon. It is the point at which a cutout of the shape could be
   * perfectly balanced on the tip of a pin.
   *
   * The centroid of a polygon is the intersection of all straight lines that
   * evenly divide the polygon into two parts of equal moment about the line.
   * The centroid of a convex polygon is inside the polygon. The centroid of a
   * non-convex polygon can be outside the polygon.
   *
   * The center and centroid of an object with uniform density are equal.
   *
   * @return {Point}
   *     the center/centroid of this polygon.
   */
  center() {
    const n = this.vertexes.length;
    if (n === 0) {
      throw new Error('This polygon has no vertex.');
    }
    let cx = 0;
    let cy = 0;
    let area = 0;
    for (let i = 0; i < n; ++i) {
      const p1 = this.vertexes[i];
      const p2 = this.vertexes[(i + 1) % n];
      const a = p1.x * p2.y - p2.x * p1.y;
      cx += (p1.x + p2.x) * a;
      cy += (p1.y + p2.y) * a;
      area += a;
    }
    area /= 2.0;
    cx /= 6.0 * area;
    cy /= 6.0 * area;
    return new Point(cx, cy);
  }

  /**
   * Tests whether this polygon is a convex.
   *
   * @return {boolean}
   *     `true` if this polygon is a convex; `false` otherwise.
   */
  isConvex() {
    const n = this.vertexes.length;
    if (n < 3) {
      return false;
    }
    const side = new Line(this.vertexes[0], this.vertexes[1]);
    const relation = this.vertexes[2].relationToLine(side);
    for (let i = 1; i < n; ++i) {
      side.start = this.vertexes[i];
      side.end = this.vertexes[(i + 1) % n];
      const p = this.vertexes[(i + 2) % n];
      if (p.relationToLine(side) !== relation) {
        return false;
      }
    }
    return true;
  }

  /**
   * Rotates this polygon by a given angle around a given point.
   *
   * @param {Point} o
   *     The point around which the rotation is performed.
   * @param {number} angle
   *     The angle of rotation, in radians.
   * @return {Polygon}
   *     A new `Polygon` object representing the result polygon after rotating
   *     this triangle around the given point by the given angle.
   */
  rotate(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const vertexes = this.vertexes.map((v) => v.rotateAroundImpl(o, sin, cos));
    return new Polygon(vertexes);
  }

  /**
   * Translate this polygon by the specified displacement.
   *
   * @param {Point} delta
   *    The vector represents the displacement by which this polygon is
   *    translated.
   * @return {Polygon}
   *    A new `Polygon` object representing the result polygon after
   *    translating this polygon by the specified displacement.
   */
  translate(delta) {
    return new Polygon(this.vertexes.map((v) => v.add(delta)));
  }

  /**
   * Checks if this polygon is equal to another polygon.
   *
   * Note that a polygon is equal to another polygon if and only if all their
   * vertexes are equal.
   *
   * @param {Polygon} other
   *    Another polygon.
   * @return {boolean}
   *    `true` if this polygon is equal to the other polygon, `false` otherwise.
   */
  equals(other) {
    const n = this.vertexes.length;
    for (let i = 0; i < n; ++i) {
      if (!this.vertexes[i].equals(other.vertexes[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Compares this polygon with another polygon
   *
   * The function will compare the vertexes of two polygons in the clockwise
   * order.
   *
   * @param {Polygon} t
   *     Another polygon.
   * @return {number}
   *     A negative value if this polygon is less than the other polygon, a
   *     positive value if this polygon is greater than the other polygon, or
   *     zero if this polygon equals the other polygon.
   */
  compareTo(t) {
    const n = this.vertexes.length;
    for (let i = 0; i < n; ++i) {
      const result = this.vertexes[i].compareTo(t.vertexes[i]);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  }
}

export default Polygon;
