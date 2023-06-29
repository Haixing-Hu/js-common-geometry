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
 * This class represents a triangle in a plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Triangle {
  /**
   * Constructs a triangle.
   *
   * @param {Point} a
   *     the first vertex of the triangle.
   * @param {Point} b
   *     the second vertex of the triangle.
   * @param {Point} c
   *     the third vertex of the triangle.
   */
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    Object.freeze(this);    //  make this object immutable
  }

  /**
   * Gets the three vertexes of this triangle.
   *
   * @return {Point[]}
   *     the three vertexes of this triangle.
   */
  vertexes() {
    return [this.a, this.b, this.c];
  }

  /**
   * Gets the three sides of this triangle.
   *
   * @return {Line[]}
   *    the three sides of this triangle.
   */
  sides() {
    return [
      new Line(this.a, this.b),
      new Line(this.b, this.c),
      new Line(this.c, this.a),
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
   * @return {Line}
   *    the side between vertex A and B of this triangle.
   */
  sideAB() {
    return new Line(this.a, this.b);
  }

  /**
   * Gets the side between vertex B and C of this triangle.
   *
   * @return {Line}
   *    the side between vertex B and C of this triangle.
   */
  sideBC() {
    return new Line(this.b, this.c);
  }

  /**
   * Gets the side between vertex C and A of this triangle.
   *
   * @return {Line}
   *    the side between vertex C and A of this triangle.
   */
  sideCA() {
    return new Line(this.c, this.a);
  }

  /**
   * Gets the center point of this triangle.
   *
   * @return {Point}
   *    the center point of this triangle.
   */
  center() {
    return new Point((this.a.x + this.b.x + this.c.x) / 3.0,
                     (this.a.y + this.b.y + this.c.y) / 3.0);
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
   * Rotates this triangle by a given angle around a given point.
   *
   * @param {Point} p
   *     The point around which the rotation is performed.
   * @param {number} angle
   *     The angle of rotation, in radians.
   * @return {Triangle}
   *     A new `Triangle` object representing the result triangle after rotating
   *     this triangle around the given point by the given angle.
   */
  rotate(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = p.x * (1 - cos) + p.y * sin;
    const dy = p.y * (1 - cos) - p.x * sin;
    const new_a = new Point(this.a.x * cos - this.a.y * sin + dx,
                            this.a.x * sin + this.a.y * cos + dy);
    const new_b = new Point(this.b.x * cos - this.b.y * sin + dx,
                            this.b.x * sin + this.b.y * cos + dy);
    const new_c = new Point(this.c.x * cos - this.c.y * sin + dx,
                            this.c.x * sin + this.c.y * cos + dy);
    return new Triangle(new_a, new_b, new_c);
  }

  /**
   * Translate this triangle by the specified displacement.
   *
   * @param {Point} p
   *    The vector represents the displacement by which this triangle is
   *    translated.
   * @return {Triangle}
   *    A new `Triangle` object representing the result triangle after
   *    translating this triangle by the specified displacement.
   */
  translate(p) {
    return new Triangle(this.a.add(p), this.b.add(p), this.c.add(p));
  }
}
