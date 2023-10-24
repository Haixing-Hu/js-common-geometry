////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import { eq, isNonZero, isZero, sign } from './Utils';
import Point from './Point';

/**
 * This class represents a line in a plane.
 *
 * A line has no ending points and has infinity length. But in order to specify
 * the direction of a line, we use a starting point and and a ending point to
 * define a infinity line.
 *
 * This class is immutable.
 *
 * @see LineSegment
 * @author Haixing Hu
 */
class Line {
  /**
   * Constructs a line with infinite length.
   *
   * @param {Point} start
   *    the first point used to define the line.
   * @param {Point} end
   *    the second point used to define the line.
   */
  constructor(start, end) {
    if (start.equals(end)) {
      throw new Error('The two points defining a line cannot be same.');
    }
    this.start = start;
    this.end = end;
    Object.freeze(this);    // make this object immutable
  }

  /**
   * Calculates the angle between this line and the x-axis.
   *
   * @return {number}
   *     The angle between this line and the x-axis in radians.
   */
  angle() {
    return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
  }

  /**
   * Calculates the angle between this line and another line.
   *
   * @param {Line} other
   *     Another line.
   * @return {number}
   *     The angle between this line and the other line, in radians.
   */
  angleWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    return u.angleWith(v);
  }

  /**
   * Calculates the angle between this line and another line segment.
   *
   * @param {LineSegment} s
   *     Another line segment.
   * @return {number}
   *     The angle between this line and the other line segment, in radians.
   */
  angleWithLineSegment(s) {
    const u = this.end.subtract(this.start);
    const v = s.end.subtract(s.start);
    return u.angleWith(v);
  }

  /**
   * Calculates the shortest distance from this line to another line.
   *
   * If the two lines are parallel or collinear, the shortest distance between
   * two lines are 0. Otherwise, the shortest distance between two lines is the
   * length of the perpendicular line segment between the two lines.
   *
   * @param {Line} other
   *     Another line.
   * @return {number}
   *     The shortest distance from this line to the other line.
   */
  distanceTo(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    const r = u.cross(v);
    if (isZero(r)) {   // the two lines are parallel or collinear
      return this.start.distanceToLine(other);
    } else {
      return 0;         // the two lines are intersect
    }
  }

  /**
   * Calculates the shortest distance from this line to the specified line segment.
   *
   * If the two lines are parallel or collinear, the shortest distance between
   * two lines are 0. Otherwise, the shortest distance between two lines is the
   * length of the perpendicular line segment between the two lines.
   *
   * @param {LineSegment} s
   *     The specified line segment.
   * @return {number}
   *     The shortest distance from this line to the specified line segment.
   */
  distanceToLineSegment(s) {
    return s.distanceToLine(this);
  }

  /**
   * Calculates the shortest distance from this line to the specified point.
   *
   * @param {Point} p
   *     The specified point.
   * @return {number}
   *     The shortest distance from this line to the specified point.
   */
  distanceToPoint(p) {
    return p.distanceToLine(this);
  }

  /**
   * Computes the nearest point on this line to the specified point, which is
   * the perpendicular projection of the specified point onto this line.
   *
   * @param {Point} p
   *     The specified point.
   * @return {Point}
   *     The nearest point on this line to the specified point, which is the
   *     perpendicular projection of the specified point onto this line.
   */
  nearestPointToPoint(p) {
    const u = this.end.subtract(this.start);
    const v = p.subtract(this.start);
    const t = u.dot(v) / u.dot(u);
    return new Point(this.start.x + u.x * t, this.start.y + u.y * t);
  }

  /**
   * Rotates this line around a specified point by a specified angle.
   *
   * @param {Point} o
   *    The specified point.
   * @param {number} angle
   *    The angle of rotation in radians.
   * @return {Line}
   *    A new `Line` object representing the line rotated from this line.
   */
  rotate(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newStart = this.start.rotateImpl(o, sin, cos);
    const newEnd = this.start.rotateImpl(o, sin, cos);
    return new Line(newStart, newEnd);
  }

  /**
   * Translate this line by the specified displacement.
   *
   * @param {Point} delta
   *    The vector represents the displacement by which this line is translated.
   * @return {Line}
   *    A new `Line` object representing the result line after translating this
   *    line by the specified displacement.
   */
  translate(delta) {
    return new Line(this.start.add(delta), this.end.add(delta));
  }

  /**
   * Tests whether this line contains the specified point.
   *
   * @param {Point} p
   *    the specified point.
   * @return {boolean}
   *    `true` if this line contains the specified point, `false` otherwise.
   * @see Point.isOnLine()
   */
  containsPoint(p) {
    return p.isOnLine(this);
  }

  /**
   * Tests whether this line contains the specified line segment.
   *
   * @param {LineSegment} s
   *    The specified line segment.
   * @return {boolean}
   *    `true` if this line contains the specified line segment, `false` otherwise.
   */
  containsLineSegment(s) {
    return s.start.isOnLine(this) && s.end.isOnLine(this);
  }

  /**
   * Tests whether this line is equal to another line.
   *
   * Note that a line is equal to another line if and only if they are collinear.
   *
   * @param {Line} other
   *    Another line.
   * @return {boolean}
   *    `true` if this line is equal to the other line, `false` otherwise.
   */
  equals(other) {
    return this.isCollinearWith(other);
  }

  /**
   * Compares this line with another line.
   *
   * This function first compares the angles between two lines and the x-axis,
   * considering the line with a smaller angle as the smaller line. Then it
   * compares the intercepts of the two lines on the x-axis, considering the
   * line with a smaller x-axis intercept as the smaller line. If both lines
   * are parallel to the x-axis, it compares the intercepts of the two lines
   * on the y-axis, considering the line with a larger y-axis intercept as
   * the smaller line.
   *
   * @param {Line} other
   *     Another line.
   * @return {number}
   *     A negative value if this line is considered as less than the other line;
   *     a positive value if this line is considered as greater than the other
   *     line; or zero if this line is considered as equal to the other line.
   */
  compareTo(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    const r = v.cross(u); // from v to u
    if (isZero(r)) {      // this line is parallel or collinear with other line
      const w = this.start.subtract(other.start);
      return sign(w.cross(v));  // the one on the left is considered as smaller
    } else {
      return sign(r);     // the one with smaller angle is considered as smaller
    }
  }

  /**
   * Calculates the relationship between this line and another line.
   *
   * @param {Line} other
   *     Another line.
   * @return {string}
   *     The relationship of this line with the other line, which may have the
   *     following values:
   *     - `'collinear'`: indicates this line is collinear with the other line,
   *        i.e., they are actually the same line;
   *     - `'parallel'`: indicates this line is parallel with the other line;
   *     - `'intersect'`: indicates this line intersects with the other line.
   * @see equals
   * @see isParallelWith
   * @see intersectsWith
   */
  relationTo(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    if (isZero(u.cross(v))) {   // this line is parallel or collinear with other line
      const w = this.start.subtract(other.start);
      if (isZero(w.cross(v))) { // this.start is on the other line
        return 'collinear';
      } else {
        return 'parallel';
      }
    } else {
      return 'intersect';
    }
  }

  /**
   * Tests whether this line is parallel with another line.
   *
   * @param {Line} other
   *    Another line.
   * @returns {boolean}
   *    `true` if this line is parallel with the other line; `false` otherwise.
   *     Note that is two lines are collinear, this function considers them as
   *     parallel and returns `true`.
   * @see equals
   * @see relationTo
   * @see intersectsWith
   */
  isParallelWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    return isZero(u.cross(v));
  }

  /**
   * Tests whether this line is collinear with another line.
   *
   * Note that a line is equal to another line if and only if they are collinear.
   *
   * @param {Line} other
   *    Another line.
   * @return {boolean}
   *    `true` if this line is collinear with the other line; `false` otherwise.
   */
  isCollinearWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    if (isZero(u.cross(v))) {   // this line is parallel or collinear with other line
      const w = this.start.subtract(other.start);
      return isZero(w.cross(v));// this.start is on the other line
    } else {
      return false;
    }
  }

  /**
   * Determines if this line intersects with another line.
   *
   * @param {Line} other
   *     Another line.
   * @return {boolean}
   *     Returns `true` if this line intersects with the other line; otherwise,
   *     returns `false`. Note that is two lines are collinear, this function
   *     considers them as parallel and returns `false`.
   * @see equals
   * @see relationTo
   * @see isParallelWith
   */
  intersectsWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    return isNonZero(u.cross(v));
  }

  /**
   * Calculates the intersection point of this line and another line.
   *
   * @param {Line} l
   *     Another line.
   * @return {Point|string}
   *     Returns the intersection point if this line intersects with the other
   *     line; returns the string 'collinear' if the two lines are collinear;
   *     returns the string 'parallel' if the two lines are parallel.
   */
  intersectionPointWith(l) {
    const a1 = this.end.y - this.start.y;
    const b1 = this.start.x - this.end.x;
    const c1 = this.end.x * this.start.y - this.start.x * this.end.y;
    const a2 = l.end.y - l.start.y;
    const b2 = l.start.x - l.end.x;
    const c2 = l.end.x * l.start.y - l.start.x * l.end.y;
    const r1 = a1 * b2;
    const r2 = a2 * b1;
    if (eq(r1, r2)) {
      if (eq(a1 * c2, a2 * c1) && eq(b1 * c2, b2 * c1)) { // 共线
        return 'collinear';
      } else {    // 平行
        return 'parallel';
      }
    } else {      // 相交
      const r = r1 - r2;
      const x = (b1 * c2 - b2 * c1) / r;
      const y = (a2 * c1 - a1 * c2) / r;
      return new Point(x, y);
    }
  }

  /**
   * Calculates the relationship between this line and a specified line segment.
   *
   * @param {LineSegment} s
        the specified line segment.
   * @returns {string}
   *    The relationship of this line and the specified line segment, which may
   *    have the following values:
   *    - `'collinear'`: indicates this line is collinear with the line segment,
   *       i.e., they are actually on the same line;
   *    - `'parallel'`: indicates this line is parallel with the line segment;
   *    - `'intersect'`: indicates this line intersects with the line segment.
   *    - `'left'`: this line is on the left side of the specified line segment.
   *    - `'right'`: this line is on the left side of the specified line segment.
   * @see isParallelWithLineSegment
   * @see isCollinearWithLineSegment
   * @see intersectsWithLineSegment
   */
  relationToLineSegment(s) {
    const r1 = s.start.relationToLine(this);
    const r2 = s.end.relationToLine(this);
    if (r1 === 'on' && r2 === 'on') {
      return 'collinear';
    } else if (r1 !== r2) {
      return 'intersect';
    } else if (this.isParallelWithLineSegment(s)) {
      return 'parallel';
    } else if (r1 === 'left') {
      return 'right';
    } else {
      return 'left';
    }
  }


  /**
   * Tests whether this line is parallel with a specified line segment.
   *
   * @param {LineSegment} s
   *    The specified line segment.
   * @returns {boolean}
   *    `true` if this line is parallel with the specified line segment; `false`
   *     otherwise. Note that is two lines are collinear, this function
   *     considers them as parallel and returns `true`.
   * @see relationToLineSegment
   * @see isCollinearWithLineSegment
   * @see intersectsWithLineSegment
   */
  isParallelWithLineSegment(s) {
    const u = this.end.subtract(this.start);
    const v = s.end.subtract(s.start);
    return isZero(u.cross(v));
  }

  /**
   * Tests whether this line is collinear with the specified line segment.
   *
   * @param {LineSegment} s
   *    The specified line segment.
   * @return {boolean}
   *    `true` if this line is collinear with the specified line segment;
   *    `false` otherwise.
   * @see relationToLineSegment
   * @see isParallelWithLineSegment
   * @see intersectsWithLineSegment
   */
  isCollinearWithLineSegment(s) {
    const u = this.end.subtract(this.start);
    const v = s.end.subtract(s.start);
    if (isZero(u.cross(v))) {   // this line is parallel or collinear with other line
      const w = this.start.subtract(s.start);
      return isZero(w.cross(v));// this.start is on the other line
    } else {
      return false;
    }
  }

  /**
   * Determines if this line intersects with the specified line segment.
   *
   * @param {LineSegment} s
   *     The specified line segment.
   * @return {boolean}
   *     Returns `true` if this line intersects with the specified line segment;
   *     otherwise, returns `false`.
   * @see relationToLineSegment
   * @see isParallelWithLineSegment
   * @see isCollinearWithLineSegment
   */
  intersectsWithLineSegment(s) {
    const r1 = s.start.relationToLine(this);
    if (r1 === 'on') {
      return true;
    }
    const r2 = s.end.relationToLine(this);
    return r1 !== r2;
  }

  /**
   * Calculates the intersection point of this line and a specified line segment.
   *
   * @param {LineSegment} s
   *     The specified line segment.
   * @return {Point|string}
   *     Returns the intersection point if this line intersects with the
   *     specified line segment; returns the string 'collinear' if this line is
   *     collinear with the specified line segment; returns the string
   *     'parallel' if this line is parallel with the specified line segment;
   *     returns the string 'disjoint' if this line is disjoint with the
   *     specified line segment.
   */
  intersectionPointWithLineSegment(s) {
    const r = this.intersectionPointWith(s.line());
    if (typeof r === 'string') {
      return r;
    } else if (r instanceof Point) {
      if (s.containsPoint(r)) {
        return r;
      } else {
        return 'disjoint';
      }
    }
    throw Error('Unexpected return value from Line.intersectionPointWith()');
  }
}

export default Line;
