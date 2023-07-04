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
import { eq, geq, isNonPositive, isZero, leq } from './Utils';
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
  line() {
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
   * Computes the nearest point on this line segment to the specified point,
   * which is either the perpendicular projection of the specified point onto the
   * line of this line segment or one of the endpoints of this line segment.
   *
   * @param {Point} p
   *     The specified point.
   * @return {Point}
   *     The nearest point on this line segment to the specified point, which is
   *     either the perpendicular projection of the specified point onto the
   *     line of this line segment or one of the endpoints of this line segment.
   */
  nearestPointToPoint(p) {
    const u = this.end.subtract(this.start);
    const v = p.subtract(this.start);
    const r = u.dot(v);
    if (r <= 0) {       // the projection of p is on the backward extension of l
      return this.start;
    }
    const w = u.dot(u);
    if (geq(r, w)) {    // the projection of p is on the forward extension of l
      return this.end;
    } else {            // the projection of p is between the line segment endpoints
      return this.line().nearestPointToPoint(p);
    }
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
  rotate(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newStart = this.start.rotateImpl(o, sin, cos);
    const newEnd = this.start.rotateImpl(o, sin, cos);
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
   * Checks if this line segment contains another line segment.
   *
   * A line segment contains another line segment if and only if both the ending
   * points of the other line segment are on the line segment.
   *
   * @param {LineSegment} other
   *    Another line segment.
   * @return {boolean}
   *    `true` if this line segment contains the other line segment, `false`
   *    otherwise.
   * @see Point.isOnLineSegment
   */
  contains(other) {
    return other.start.isOnLineSegment(this)
        && other.end.isOnLineSegment(this);
  }

  /**
   * Tests whether this line segment contains the specified point.
   *
   * @param {Point} p
   *    the specified point.
   * @return {boolean}
   *    `true` if this line segment contains the specified point, `false`
   *    otherwise.
   * @see Point.isOnLineSegment
   */
  containsPoint(p) {
    return p.isOnLineSegment(this);
  }

  /**
   * Tests whether this directed line segment is equal to another directed line
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
    if (this.isParallelWith(other)) {
      if (this.start.isOnLine(other.line())) {
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
   * @see relationTo
   * @see equals
   * @see isCollinearWith
   * @see intersectsWith
   */
  isParallelWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    return isZero(u.cross(v));
  }

  /**
   * Tests whether this line segment is collinear with another line segment.
   *
   * @param {LineSegment} other
   *    Another line segment.
   * @return {boolean}
   *    `true` if this line segment is collinear with the other line segment;
   *    `false` otherwise. Note that is two line segments are equal, this
   *    function considers them as collinear and returns `true`.
   * @see relationTo
   * @see equals
   * @see isParallelWith
   * @see intersectsWith
   */
  isCollinearWith(other) {
    return this.isParallelWith(other)
        && this.start.isOnLine(other.line());
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
   *     segment; otherwise, returns `false`. Note that if thw two line segments
   *     are equal, or they are collinear and overlapping, **they are also
   *     considered as intersecting**.
   * @see relationTo
   * @see equals
   * @see isParallelWith
   * @see isCollinearWith
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
   * Calculates the intersection point of this line segment and another line
   * segment.
   *
   * @param {LineSegment} other
   *     Another line segment.
   * @return {Point|string}
   *     Returns the intersection point if this line segment intersects with the
   *     other line segment; returns the string 'collinear' if the two line
   *     segments are collinear or equal; returns the string 'parallel' if the
   *     two line segments are parallel; returns the string 'disjoint' if the
   *     two line segments are disjoint.
   */
  intersectionPointWith(other) {
    const r = this.line().intersectionPointWith(other.line());
    if (typeof r === 'string') {
      if (r === 'parallel') {
        return 'parallel';
      } else if (r === 'collinear') {
        // This line segment and the other line segment are collinear,
        // then we must test whether they are overlapping or disjoint.
        // Note that we CANNOT just compare the x-coordinates or y-coordinates
        // of their ending points, since they may be parallel with x-axis or y-axis.
        const thisPoints = [this.start, this.end].sort((p1, p2) => p1.compareTo(p2));
        const otherPoints = [other.start, other.end].sort((p1, p2) => p1.compareTo(p2));
        const r1 = thisPoints[1].compareTo(otherPoints[0]);
        const r2 = otherPoints[1].compareTo(thisPoints[0]);
        if (r1 < 0 || r2 < 0) {
          return 'disjoint';
        } else if (r1 === 0) {
          return thisPoints[1];
        } else if (r2 === 0) {
          return otherPoints[1];
        } else {
          return 'collinear';
        }
      }
    } else if (r instanceof Point) {
      if (this.containsPoint(r) && other.containsPoint(r)) {
        return r;
      } else {
        return 'disjoint';
      }
    }
    throw Error('Unexpected return value from Line.intersectionPointWith()');
  }

  /**
   * Calculates the relationship between this line segment and a specified line.
   *
   * @param {Line} l
   *    A specified line.
   * @return {string}
   *    The relationship between this line segment and the specified line, which
   *    may have the following values:
   *    - `'collinear'`: this line segment is collinear with the specified line,
   *       i.e., all its ending points are on the specified line.
   *    - `'parallel'`: this line segment is parallel with the specified line.
   *    - `'intersect'`: this line segment intersects with the specified line.
   *    - `'left'`: this line segment is on the left side of the specified line.
   *    - `'right'`: this line segment is on the left side of the specified line.
   */
  relationToLine(l) {
    const r1 = this.start.relationToLine(l);
    const r2 = this.end.relationToLine(l);
    if (r1 === 'on' && r2 === 'on') {
      return 'collinear';
    } else if (r1 !== r2) {
      return 'intersect';
    } else if (this.isParallelWithLine(l)) {
      return 'parallel';
    } else {
      return r1;
    }
  }

  /**
   * Tests whether this line segment is parallel with the specified line.
   *
   * @param {Line} l
   *    The specified line.
   * @returns {boolean}
   *    `true` if this line segment is parallel with the specified line; `false`
   *    otherwise. Note that is this line segment lies on the specified line,
   *    this function considers them as parallel and returns `true`.
   * @see relationToLine
   * @see isOnLine
   * @see intersectsWithLine
   */
  isParallelWithLine(l) {
    const u = this.end.subtract(this.start);
    const v = l.end.subtract(l.start);
    return isZero(u.cross(v));
  }

  /**
   * Tests whether this line segment is collinear with the specified line.
   *
   * @param {Line} l
   *    The specified line.
   * @return {boolean}
   *    `true` if this line segment is collinear with the specified line;
   *    `false` otherwise.
   * @see relationToLine
   * @see isParallelWithLine
   * @see intersectsWithLine
   */
  isCollinearWithLine(l) {
    return this.start.isOnLine(l) && this.end.isOnLine(l);
  }

  /**
   * Tests whether this line segment intersects with a specified line.
   *
   * @param {Line} l
   *     The specified line.
   * @return {boolean}
   *     Returns `true` if this line intersects with the specified line;
   *     otherwise, returns `false`.
   */
  intersectsWithLine(l) {
    const r1 = this.start.relationToLine(l);
    if (r1 === 'on') {
      return true;
    }
    const r2 = this.end.relationToLine(l);
    return r1 !== r2;
  }

  /**
   * Calculates the intersection point of this line segment and a specified line.
   *
   * @param {Line} l
   *     The specified line.
   * @return {Point|string}
   *     Returns the intersection point if this line segment intersects with the
   *     specified line; returns the string 'collinear' if this line segment is
   *     collinear with the specified line; returns the string 'parallel' if
   *     this line segment is parallel with the specified line; returns the
   *     string 'disjoint' if this line segment is disjoint with the specified
   *     line.
   */
  intersectionPointWithLine(l) {
    const r = this.line().intersectionPointWith(l);
    if (typeof r === 'string') {
      return r;
    } else if (r instanceof Point) {
      if (this.containsPoint(r)) {
        return r;
      } else {
        return 'disjoint';
      }
    }
    throw Error('Unexpected return value from Line.intersectionPointWith()');
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
      const side = new LineSegment(polygon[i], polygon[(i + 1) % n]);
      if (this.start.isOnLineSegment(side)) {
        pts.push(this.start);
      } else if (this.end.isOnLineSegment(side)) {
        pts.push(this.end);
      } else if (side.start.isOnLineSegment(this)) {
        pts.push(side.start);
      } else if (side.end.isOnLineSegment(this)) {
        pts.push(side.end);
      } else if (this.intersectsWith(side)) {
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
