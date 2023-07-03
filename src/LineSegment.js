/******************************************************************************
 *                                                                            *
 *    Copyright (c) 2023.                                                     *
 *    Haixing Hu                                                              *
 *                                                                            *
 *    All rights reserved.                                                    *
 *                                                                            *
 ******************************************************************************/

/******************************************************************************
 *                                                                            *
 *    Copyright (c) 2023.                                                     *
 *    Haixing Hu                                                              *
 *                                                                            *
 *    All rights reserved.                                                    *
 *                                                                            *
 ******************************************************************************/
import {eq, geq, isNonZero, isNonPositive, isZero, leq} from './Utils';
import Point from './Point';
import Line from './Line';

/**
 * This class represents a directed line segment in a plane.
 *
 * A directed line segment has a starting point and an ending point, with a
 * finite length.
 *
 * This class is immutable.
 *
 * @see Line
 * @author Haixing Hu
 */
class LineSegment {
  /**
   * Constructs a directed line segment.
   *
   * @param {Point} start
   *    the starting point of the directed line segment.
   * @param {Point} end
   *    the ending point of the directed line segment.
   * @throws {Error}
   *    if the starting point and the ending point are the same.
   */
  constructor(start, end) {
    if (start.equals(end)) {
      throw new Error('The start point and the end point of a line segment cannot be the same.');
    }
    this.start = start;
    this.end = end;
    Object.freeze(this);    // make this object immutable
  }

  /**
   * Gets the line where this line segment lies.
   *
   * @returns {Line}
   *    the `Line` object representing the line where this line segment lies.
   */
  asLine() {
    return new Line(this.start, this.end);
  }

  /**
   * Calculates the vector represented by this directed line segment, i.e., the
   * vector from the start point to the end point of this line segment.
   *
   * @return {Point}
   *     The vector represented by this directed line segment.
   */
  vector() {
    return this.end.subtract(this.start);
  }

  /**
   * Calculates the length of this line segment.
   *
   * @returns {number}
   *     The length of this line segment.
   */
  length() {
    return this.start.distanceTo(this.end);
  }

  /**
   * Calculates the center point of this line segment.
   *
   * @return {Point}
   *     The center point of this line segment.
   */
  center() {
    const x = (this.start.x + this.end.x) / 2;
    const y = (this.start.y + this.end.y) / 2;
    return new Point(x, y);
  }

  /**
   * Calculates the angle between this line segment and the x-axis.
   *
   * @return {number}
   *     The angle between this line segment and the x-axis in radians.
   */
  angle() {
    return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
  }

  /**
   * Calculates the angle between this line and another line segment.
   *
   * @param {LineSegment} other
   *     Another line segment.
   * @return {number}
   *     The angle between this line segment and the other line segment, in
   *     radians.
   */
  angleWith(other) {
    const u = this.vector();
    const v = other.vector();
    return u.angleWith(v);
  }

  /**
   * Calculates the angle between this line and another line.
   *
   * @param {Line} l
   *     Another line.
   * @return {number}
   *     The angle between this line segment and the other line, in radians.
   */
  angleWithLine(l) {
    const u = this.vector();
    const v = l.end.subtract(l.start);
    return u.angleWith(v);
  }

  /**
   * Calculates the shortest distance from this line segment to another line
   * segment.
   *
   * @param {LineSegment} other
   *     Another line segment.
   * @return {number}
   *     The shortest distance from this line segment to the other line segment.
   * @see distanceToLine
   * @see distanceToPoint
   */
  distanceTo(other) {
    if (this.intersectsWith(other)) {
      return 0;
    } else {
      const d1 = this.start.distanceToLineSegment(other);
      const d2 = this.end.distanceToLineSegment(other);
      const d3 = other.start.distanceToLineSegment(this);
      const d4 = other.end.distanceToLineSegment(this);
      return Math.min(d1, d2, d3, d4);
    }
  }

  /**
   * Calculates the shortest distance from this line segment to the specified
   * line.
   *
   * If this line segment intersects with the specified line, or any endpoint
   * of this line segment lies on the specified line, the shortest distance
   * between this line segment and the specified line is 0.
   *
   * @param {Line} l
   *     The specified line.
   * @return {number}
   *     The shortest distance from this line segment to the specified line.
   * @see distanceTo
   * @see distanceToPoint
   */
  distanceToLine(l) {
    const r1 = this.start.relationToLine(l);
    if (r1 === 'on') {
      return 0;
    }
    const r2 = this.end.relationToLine(l);
    if (r2 === 'on') {
      return 0;
    }
    if (r1 === r2) {
      const d1 = this.start.distanceToLine(l);
      const d2 = this.end.distanceToLine(l);
      return Math.min(d1, d2);
    } else {
      return 0;
    }
  }

  /**
   * Calculates the shortest distance from this line segment to the specified
   * point.
   *
   * @param {Point} p
   *     The specified point.
   * @return {number}
   *     The shortest distance from this line segment to the specified point.
   * @see distanceTo
   * @see distanceToLine
   */
  distanceToPoint(p) {
    return p.distanceToLineSegment(this);
  }

  /**
   * Rotates this line segment around its start point by a specified angle.
   *
   * @param {number} angle
   *    The angle of rotation in radians.
   * @return {LineSegment}
   *    A new `LineSegment` object representing the line segment rotated from
   *    this line segment.
   */
  rotate(angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newEnd = this.end.rotateAroundImpl(this.start, sin, cos);
    return new LineSegment(this.start, newEnd);
  }

  /**
   * Rotates this line segment around a specified point by a specified angle.
   *
   * @param {Point} o
   *    The specified point.
   * @param {number} angle
   *    The angle of rotation in radians.
   * @return {LineSegment}
   *    A new `LineSegment` object representing the line segment rotated from
   *    this line segment.
   */
  rotateAround(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newStart = this.start.rotateAroundImpl(o, sin, cos);
    const newEnd = this.start.rotateAroundImpl(o, sin, cos);
    return new LineSegment(newStart, newEnd);
  }

  /**
   * Translate this line segment by the specified displacement.
   *
   * @param {Point} delta
   *    The vector represents the displacement by which this line segment is
   *    translated.
   * @return {LineSegment}
   *    A new `LineSegment` object representing the result line segment after
   *    translating this line segment by the specified displacement.
   */
  translate(delta) {
    return new LineSegment(this.start.add(delta), this.end.add(delta));
  }

  /**
   * Tests whether this line segment contains the specified point.
   *
   * @param {Point} p
   *    the specified point.
   * @return {boolean}
   *    `true` if this line segment contains the specified point, `false`
   *    otherwise.
   * @see Point.isOnLineSegment()
   */
  containsPoint(p) {
    return p.isOnLineSegment(this);
  }

  /**
   * Checks if this directed line segment is equal to another directed line
   * segment.
   *
   * Note that a directed line segment is equal to another directed line segment
   * if and only if their start points and end points are both equal.
   *
   * @param {LineSegment} other
   *    Another line.
   * @return {boolean}
   *    `true` if this directed line segment is equal to the other directed line
   *    segment, `false` otherwise.
   */
  equals(other) {
    return this.start.equals(other.start) && this.end.equals(other.end);
  }

  /**
   * Compares this directed line segment with another directed line segment.
   *
   * The function will compare the start points of the two directed line
   * segments firstly, and then compare the end points of the two directed line
   * segments.
   *
   * @param {LineSegment} other
   *     Another directed line segment.
   * @return {number}
   *     A negative value if this directed line segment is less than the other
   *     directed line segment, a positive value if this directed line segment
   *     is greater than the other directed line segment, or zero if this
   *     directed line segment equals the other directed line segment.
   */
  compareTo(other) {
    let result = this.start.compareTo(other.start);
    if (result === 0) {
      result = this.end.compareTo(other.end);
    }
    return result;
  }

  /**
   * Calculates the relationship of this line segment with another line segment.
   *
   * @param {LineSegment} other
   *    Another line segment.
   * @return {string}
   *    The relationship of this line segment with the other line segment.
   *    Possible values are:
   *    - `'equal'`: this line segment is equal to the other line segment.
   *    - `'collinear'`: this line segment is collinear with the other line segment.
   *    - `'parallel'`: this line segment is parallel with the other line segment.
   *    - `'intersect'`: this line segment intersects with the other line segment.
   *    - `'disjoint'`: this line segment is disjoint with the other line segment.
   */
  relationTo(other) {
    if (this.equals(other)) {
      return 'equal';
    }
    if (this.parallelWith(other)) {
      if (this.start.isOnLine(other)) {
        return 'collinear';
      } else {
        return 'parallel';
      }
    }
    if (this.intersectsWith(other)) {
      return 'intersect';
    } else {
      return 'disjoint';
    }
  }

  /**
   * Tests whether this line segment is parallel with another line segment.
   *
   * @param {LineSegment} other
   *    Another line segment.
   * @returns {boolean}
   *    `true` if this line segment is parallel with the other line segment;
   *    `false` otherwise. Note that is two line segments are collinear or equal,
   *    this function considers them as parallel and returns `true`.
   * @see equals
   * @see relationTo
   * @see intersectsWith
   */
  parallelWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    return isZero(u.cross(v));
  }

  /**
   * Tests whether this line segment intersects with another line segment.
   *
   * Note that if thw two line segments are equal, or they are collinear and
   * overlapping, **they are also considered as intersecting**.
   *
   * @param {LineSegment} other
   *     Another line segment.
   * @return {boolean}
   *     Returns `true` if this line segment intersects with the other line
   *     segment; otherwise, returns `false`.
   * @see relationTo
   */
  intersectsWith(other) {
    return geq(Math.max(this.start.x, this.end.x), Math.min(other.start.x, other.end.x))
        && leq(Math.min(this.start.x, this.end.x), Math.max(other.start.x, other.end.x))
        && geq(Math.max(this.start.y, this.end.y), Math.min(other.start.y, other.end.y))
        && leq(Math.min(this.start.y, this.end.y), Math.max(other.start.y, other.end.y))
        && isNonPositive(this.start.times(other.start, this.end)
                       * this.start.times(other.end, this.end))
        && isNonPositive(other.start.times(this.start, other.end)
                       * other.start.times(this.end, other.end));
  }

  /**
   * Tests whether this line segment intersects with another line.
   *
   * @param {Line} other
   *     The specified line.
   * @return {boolean}
   *     Returns `true` if this line intersects with the specified line;
   *     otherwise, returns `false`.
   */
  intersectsWithLine(other) {
    // FIXME
    const r = (this.start.x - this.end.x) * (other.start.y - other.end.y)
            - (this.start.y - this.end.y) * (other.start.x - other.end.x);
    return isNonZero(r);
  }

  /**
   * Calculates the intersection point of this line segment and another line
   * segment.
   *
   * @param {LineSegment} other
   *     Another line segment.
   * @return {Point|string}
   *     Returns the intersection point if this line segment intersects with the
   *     other line segment; returns the string 'online' if the two line segments
   *     are collinear; returns the string 'parallel' if the two line segments
   *     are parallel; returns the string 'disjoint' if the two line segments
   *     are disjoint.
   */
  crossPointWith(other) {
    // TODO
  }

  /**
   * Tests whether this line segment is inside a specified polygon.
   *
   * @param {Polygon} polygon
   *     The specified polygon.
   * @return {boolean}
   *    `true` if this line segment is inside the specified polygon, `false`
   *    otherwise.
   */
  isInsidePolygon(polygon) {
    if ((!this.start.isInsidePolygon(polygon))
        || (!this.end.isInsidePolygon(polygon))) {
      return false;
    }
    const pts = [];
    const n = polygon.vertexes.length;
    for (let i = 0; i < n; ++i) {
      const side = new Line(polygon[i], polygon[(i + 1) % n]);
      if (this.start.isOnLineSegment(side)) {
        pts.push(this.start);
      } else if (this.end.isOnLineSegment(side)) {
        pts.push(this.end);
      } else if (side.start.isOnLineSegment(this)) {
        pts.push(side.start);
      } else if (side.end.isOnLineSegment(this)) {
        pts.push(side.end);
      } else if (this.intersectsWithLineSegment(side)) {
        return false;
      }
    }
    // sort the cross points
    pts.sort((p1, p2) => p1.compareTo(p2));
    const p = new Point();
    for (let i = 1; i < pts.length; ++i) {
      if ((!eq(pts[i - 1].x, pts[i].x)) || (!eq(pts[i - 1].y, pts[i].y))) {
        p.x = (pts[i - 1].x + pts[i].x) / 2.0;
        p.y = (pts[i - 1].y + pts[i].y) / 2.0;
        if (!p.isInsidePolygon(polygon)) {
          return false;
        }
      }
    }
    return true;
  }
}

export default LineSegment;
