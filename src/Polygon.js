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

/**
 * This class represents a polygon in a plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Polygon {
  /**
   * Constructs a polygon.
   *
   * @param {Point[]} vertexes
   *     the array of vertexes of the polygon, which must have at least 3 points.
   * @throws {Error}
   *     if the array of vertexes has less than 3 points.
   */
  constructor(vertexes) {
    if (vertexes.length < 3) {
      throw new Error('This polygon has less than 3 vertexes.');
    }
    this.vertexes = vertexes;
    Object.freeze(this);        //  make this object immutable
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
    return this.vertexes[i % n];
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
    const u = this.vertexes[i % n];
    const v = this.vertexes[(i + 1) % n];
    return new Line(u, v);
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
      result += this.vertexes[i].x * this.vertexes[(i + 1) % n].y;
      result -= this.vertexes[i].y * this.vertexes[(i + 1) % n].x;
    }
    return Math.abs(result / 2.0);
  }

  /**
   * Calculate the centroid of this polygon, applicable to any simple polygon.
   *
   * The number of vertices of this polygon must be greater than 0.
   *
   * @return {Point}
   *     the centroid of this polygon.
   */
  centroid() {
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
}

export default Polygon;
