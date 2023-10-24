////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import Point from './Point';
import LineSegment from './LineSegment';
import Rectangle from './Rectangle';
import { calculateBoundaries, isNonZero, modulo, normalize } from './Utils';

/**
 * This class represents a triangle in a plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Triangle {
  /**
   * Tests whether the specified vertexes can form a valid triangle.
   *
   * @param {Point[]} vertexes
   *    the array of vertexes to test.
   * @returns {boolean}
   *    `true` if the specified vertexes can form a valid triangle; `false`
   *    otherwise.
   */
  static isValid(vertexes) {
    if (!Array.isArray(vertexes)) {
      return false;
    }
    if (vertexes.length !== 3) {
      return false;
    }
    // 3 vertexes form a valid triangle if and only if they are not in the same
    // line, i.e., (v0 - v1) × (v2 - v1) !== 0.
    return isNonZero(vertexes[1].times(vertexes[0], vertexes[2]));
  }

  /**
   * Calculates the area of a triangle with the lengths of its three edges.
   *
   * @param {number} x
   *    the length of the first edge.
   * @param {number} y
   *    the length of the second edge.
   * @param {number} z
   *    the length of the third edge.
   */
  static areaOfEdges(x, y, z) {
    const s = (x + y + z) / 2.0;
    return Math.sqrt(s * (s - x) * (s - y) * (s - z));
  }

  /**
   * Constructs a triangle.
   *
   * The constructor must be provided with three vertexes of a triangle. The
   * vertexes could be in clockwise order or counter-clockwise order, but they
   * must form a valid triangle, i.e., they should not be in the same line.
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
   *     the three vertexes of the new triangle. The vertexes must be in
   *     clockwise order or counter-clockwise order, and they must form a valid
   *     triangle (i.e., they are not on the same line).
   * @param {boolean} normalized
   *     Indicates whether the specified vertexes are normalized. If the
   *     specified vertexes are normalized, they will be copied to the new
   *     triangle; otherwise, they will be normalized and then copied to the
   *     new triangle. The default value of this argument is `false`.
   * @throws Error
   *     If the number of vertexes is not 3, or the 3 vertexes cannot form a
   *     valid triangle.
   */
  constructor(vertexes, normalized = false) {
    if (normalized) {
      this._vertexes = vertexes.slice();
    } else {
      if (!Triangle.isValid(vertexes)) {
        throw new Error('The vertexes cannot form a valid triangle.');
      }
      this._vertexes = normalize(vertexes);
    }
    this.a = this._vertexes[0];
    this.b = this._vertexes[1];
    this.c = this._vertexes[2];
    // calculate the boundaries
    this._boundary = calculateBoundaries(this._vertexes);
    Object.freeze(this);    //  make this object immutable
  }

  /**
   * Gets the array of vertexes of this triangle.
   *
   * @return {Point[]}
   *    the array of vertexes of this triangle.
   */
  vertexes() {
    return this._vertexes;
  }

  /**
   * Gets the three sides of this triangle.
   *
   * @return {LineSegment[]}
   *    the three sides of this triangle.
   */
  sides() {
    return [
      new LineSegment(this.a, this.b),
      new LineSegment(this.b, this.c),
      new LineSegment(this.c, this.a),
    ];
  }

  /**
   * Gets the three angles of this triangle.
   *
   * @return {number[]}
   *    the three angles of this triangle, in radians.
   */
  angles() {
    return [
      this.angleA(),
      this.angleB(),
      this.angleC(),
    ];
  }

  /**
   * Gets the specified vertex of this triangle.
   *
   * @param {number} i
   *     the index of the specified vertex to get. If this index is outside the
   *     range of `[0, 3)`, it will be treated as module 3.
   * @returns {Point}
   *     the specified vertex of this triangle.
   */
  vertex(i) {
    return this._vertexes[modulo(i, 3)];
  }

  /**
   * Gets the specified side of this triangle.
   *
   * @param {number} i
   *     the index of the starting vertex of the specified side to get. If this
   *     index is outside the range of `[0, 3)`, it will be treated as module 3.
   * @return {LineSegment}
   *     the specified side of this triangle.
   */
  side(i) {
    const u = this._vertexes[modulo(i, 3)];
    const v = this._vertexes[modulo(i + 1, 3)];
    return new LineSegment(u, v);
  }

  /**
   * Gets the specified angle of this triangle.
   *
   * @param {number} i
   *     the index of the specified angle to get. If this index is outside the
   *     range of `[0, 3)`, it will be treated as module 3.
   * @return {number}
   *     the specified angle of this triangle, in radian.
   */
  angle(i) {
    const x = this._vertexes[modulo(i - 1, 3)];
    const y = this._vertexes[modulo(i, 3)];
    const z = this._vertexes[modulo(i + 1, 3)];
    const u = x.subtract(y);
    const v = z.subtract(y);
    return u.angleWith(v);
  }

  /**
   * Gets the angle at vertex A of this triangle.
   *
   * @return {number}
   *     the angle at vertex A of this triangle, in radians.
   */
  angleA() {
    const u = this.b.subtract(this.a);
    const v = this.c.subtract(this.a);
    return u.angleWith(v);
  }

  /**
   * Gets the angle at vertex B of this triangle.
   *
   * @return {number}
   *     the angle at vertex B of this triangle, in radians.
   */
  angleB() {
    const u = this.a.subtract(this.b);
    const v = this.c.subtract(this.b);
    return u.angleWith(v);
  }

  /**
   * Gets the angle at vertex C of this triangle.
   *
   * @return {number}
   *     the angle at vertex C of this triangle, in radians.
   */
  angleC() {
    const u = this.a.subtract(this.c);
    const v = this.b.subtract(this.c);
    return u.angleWith(v);
  }

  /**
   * Gets the side between vertex A and B of this triangle.
   *
   * @return {LineSegment}
   *    the side between vertex A and B of this triangle.
   */
  sideAB() {
    return new LineSegment(this.a, this.b);
  }

  /**
   * Gets the side between vertex B and C of this triangle.
   *
   * @return {LineSegment}
   *    the side between vertex B and C of this triangle.
   */
  sideBC() {
    return new LineSegment(this.b, this.c);
  }

  /**
   * Gets the side between vertex C and A of this triangle.
   *
   * @return {LineSegment}
   *    the side between vertex C and A of this triangle.
   */
  sideCA() {
    return new LineSegment(this.c, this.a);
  }

  /**
   * Gets the left boundary of this triangle, i.e., the smallest x-coordinate of
   * all the vertexes of this triangle.
   *
   * @return {number}
   *    the left boundary of this triangle.
   */
  left() {
    return this._boundary.left;
  }

  /**
   * Gets the right boundary of this triangle, i.e., the largest x-coordinate of
   * all the vertexes of this triangle.
   *
   * @return {number}
   *    the right boundary of this triangle.
   */
  right() {
    return this._boundary.right;
  }

  /**
   * Gets the top boundary of this triangle, i.e., the largest or smallest
   * y-coordinate of all the vertexes of this triangle, depending on the value of
   * Config.Y_AXIS_DIRECTION.
   *
   * @return {number}
   *    the top boundary of this triangle.
   * @see Config.Y_AXIS_DIRECTION
   */
  top() {
    return this._boundary.top;
  }

  /**
   * Gets the bottom boundary of this triangle, i.e., the smallest or largest
   * y-coordinate of all the vertexes of this triangle, depending on the value of
   * Config.Y_AXIS_DIRECTION.
   *
   * @return {number}
   *    the bottom boundary of this triangle.
   * @see Config.Y_AXIS_DIRECTION
   */
  bottom() {
    return this._boundary.bottom;
  }

  /**
   * Gets the bounding rectangle of this triangle.
   *
   * @return {Rectangle}
   *    the bounding rectangle of this triangle.
   */
  boundingRectangle() {
    const vertexes = [
      new Point(this._boundary.left, this._boundary.top),
      new Point(this._boundary.right, this._boundary.top),
      new Point(this._boundary.right, this._boundary.bottom),
      new Point(this._boundary.left, this._boundary.bottom),
    ];
    return new Rectangle(vertexes, true);
  }

  /**
   * Gets the center point of this triangle.
   *
   * @return {Point}
   *    the center point of this triangle.
   */
  center() {
    const x = (this.a.x + this.b.x + this.c.x) / 3.0;
    const y = (this.a.y + this.b.y + this.c.y) / 3.0;
    return new Point(x, y);
  }

  /**
   * Calculates the area of this triangle.
   *
   * @return {number}
   *    the area of this triangle.
   */
  area() {
    const u = this.a.subtract(this.b);
    const v = this.a.subtract(this.c);
    return Math.abs(u.cross(v)) / 2.0;
  }

  /**
   * Rotates this triangle by a given angle around a given point.
   *
   * @param {Point} o
   *     The point around which the rotation is performed.
   * @param {number} angle
   *     The angle of rotation, in radians.
   * @return {Triangle}
   *     A new `Triangle` object representing the result triangle after rotating
   *     this triangle around the given point by the given angle.
   */
  rotate(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newVertexes = this._vertexes.map((p) => p.rotateImpl(o, sin, cos));
    // note that the rotated vertexes may not be normalized, since the top-left
    // vertex may not be the top-left vertex after rotation.
    return new Triangle(newVertexes, false);
  }

  /**
   * Translate this triangle by the specified displacement.
   *
   * @param {Point} delta
   *    The vector represents the displacement by which this triangle is
   *    translated.
   * @return {Triangle}
   *    A new `Triangle` object representing the result triangle after
   *    translating this triangle by the specified displacement.
   */
  translate(delta) {
    const newVertexes = this._vertexes.map((p) => p.add(delta));
    // note that the translated vertexes is also normalized
    return new Triangle(newVertexes, true);
  }

  /**
   * Checks if this triangle is equal to another triangle.
   *
   * Note that a triangle is equal to another triangle if and only if all their
   * vertexes are equal.
   *
   * @param {Triangle} t
   *    Another triangle.
   * @return {boolean}
   *    `true` if this triangle is equal to the other triangle, `false` otherwise.
   */
  equals(t) {
    return this.a.equals(t.a) && this.b.equals(t.b) && this.c.equals(t.c);
  }

  /**
   * Compares this triangle with another triangle
   *
   * The function will compare the first points of the two triangle firstly,
   * and then compare the second points of the two triangle, and compare the
   * third points of the two triangle.
   *
   * @param {Triangle} t
   *     Another triangle.
   * @return {number}
   *     A negative value if this triangle is less than the other triangle, a
   *     positive value if this triangle is greater than the other triangle,
   *     or zero if this triangle equals the other triangle.
   */
  compareTo(t) {
    let result = this.a.compareTo(t.a);
    if (result === 0) {
      result = this.b.compareTo(t.b);
      if (result === 0) {
        result = this.c.compareTo(t.c);
      }
    }
    return result;
  }
}

export default Triangle;
