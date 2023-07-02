/******************************************************************************
 *                                                                            *
 *    Copyright (c) 2023.                                                     *
 *    Haixing Hu                                                              *
 *                                                                            *
 *    All rights reserved.                                                    *
 *                                                                            *
 ******************************************************************************/
import { eq, geq, isNonZero, isNonPositive, isZero, sign } from './Utils';
import Point from './Point';

/**
 * This class represents a line or a line segment in a plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Line {
  constructor(start, end) {
    this.start = start;
    this.end = end;
    Object.freeze(this);    // make this object immutable
  }

  /**
   * Calculates the vector from the start point to the end point of this line s
   * egment.
   *
   * @return {Point}
   *     The vector from the start point to the end point of this line segment.
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
   * Calculates the angle between this line and the x-axis.
   *
   * @return {number}
   *     The angle between this line and the x-axis in radians.
   */
  angle() {
    return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
  }

  /**
   * Calculates the center point of this line segment.
   *
   * @return {Point}
   *     The center point of this line segment.
   */
  center() {
    return new Point(
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2,
    );
  }


  /**
   * Calculates the angle between this line and another specified line.
   *
   * @param {Line} l
   *     Another specified line.
   * @return {number}
   *     The angle between this line and the other line in radians.
   */
  angleWith(l) {
    const u = this.vector();
    const v = l.vector();
    return u.angleWith(v);
  }

  /**
   * Calculates the shortest distance from this line to another specified line.
   *
   * @param {Line} l
   *     Another specified line.
   * @return {number}
   *     The shortest distance from this line to the other specified line.
   */
  distanceTo(l) {
    if (this.intersectsWithLine(l)) {
      return 0;
    } else {
      const d1 = this.start.distanceTo(l);
      const d2 = this.end.distanceTo(l);
      const d3 = l.start.distanceTo(this);
      const d4 = l.end.distanceTo(this);
      return Math.min(d1, d2, d3, d4);
    }
  }

  /**
   * Rotates this line segment around its start point by a specified angle.
   *
   * @param {number} angle
   *     The angle of rotation in radians.
   * @return {Line}
   *     A new `Line` object representing the line segment rotated from this
   *     line segment.
   */
  rotate(angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newEnd = this.end.rotateAroundImpl(this.start, sin, cos);
    return new Line(this.start, newEnd);
  }

  /**
   * Rotates this line segment around a specified point by a specified angle.
   *
   * @param {Point} o
   *    The specified point.
   * @param {number} angle
   *    The angle of rotation in radians.
   */
  rotateAround(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newStart = this.start.rotateAroundImpl(o, sin, cos);
    const newEnd = this.start.rotateAroundImpl(o, sin, cos);
    return new Line(newStart, newEnd);
  }

  /**
   * Translate this line segment by the specified displacement.
   *
   * @param {Point} delta
   *    The vector represents the displacement by which this line segment is
   *    translated.
   * @return {Line}
   *    A new `Line` object representing the result line segment after
   *    translating this line segment by the specified displacement.
   */
  translate(delta) {
    return new Line(this.start.add(delta), this.end.add(delta));
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
   * @param {Line} l
   *    Another line.
   * @return {boolean}
   *    `true` if this directed line segment is equal to the other directed line
   *    segment, `false` otherwise.
   */
  equals(l) {
    return this.start.equals(l.start) && this.end.equals(l.end);
  }

  /**
   * Compares this directed line segment with another directed line segment.
   *
   * The function will compare the start points of the two directed line
   * segments firstly, and then compare the end points of the two directed line
   * segments.
   *
   * @param {Line} l
   *     Another directed line segment.
   * @return {number}
   *     A negative value if this directed line segment is less than the other
   *     directed line segment, a positive value if this directed line segment
   *     is greater than the other directed line segment, or zero if this
   *     directed line segment equals the other directed line segment.
   */
  compareTo(l) {
    let result = this.start.compareTo(l.start);
    if (result === 0) {
      result = this.end.compareTo(l.end);
    }
    return result;
  }

  /**
   * Determines if this line intersects with another specified line.
   *
   * @param {Line} other
   *     The specified line.
   * @return {boolean}
   *     Returns `true` if this line intersects with the specified line;
   *     otherwise, returns `false`. Note that is two line segments are on the
   *     same line, this function considers them as parallel and returns
   *     `false`.
   */
  intersectsWithLine(other) {
    const r = (this.start.x - this.end.x) * (other.start.y - other.end.y)
            - (this.start.y - this.end.y) * (other.start.x - other.end.x);
    return isNonZero(r);
  }


  /**
   * Determines if this line intersects or coline with another specified line.
   *
   * @param {Line} other
   *     The specified line.
   * @return {boolean}
   *     Returns `true` if this line intersects or coline with the specified line;
   *     otherwise, returns `false`. Note that is two line segments are on the
   *     same line, this function returns `true`.
   */
  intersectsOrColineWithLine(other) {
    const r = (this.start.x - this.end.x) * (other.start.y - other.end.y)
      - (this.start.y - this.end.y) * (other.start.x - other.end.x);
    if (isZero(r)) {  // the two lines are parallel or coline
      return this.start.isOnLine(other);
    } else {          // the two lines are not parallel
      return true;
    }
  }

  /**
   * Determines if this line segment intersects with another specified line
   * segment.
   *
   * @param {Line} other
   *     The specified line segment.
   * @return {boolean}
   *     Returns `true` if this line segment intersects with the specified line
   *     segment; otherwise, returns `false`.
   */
  intersectsWithLineSegment(other) {
    const thisMaxX = Math.max(this.start.x, this.end.x);
    const thisMinX = Math.min(this.start.x, this.end.x);
    const thisMaxY = Math.max(this.start.y, this.end.y);
    const thisMinY = Math.min(this.start.y, this.end.y);
    const otherMaxX = Math.max(other.start.x, other.end.x);
    const otherMinX = Math.min(other.start.x, other.end.x);
    const otherMaxY = Math.max(other.start.y, other.end.y);
    const otherMinY = Math.min(other.start.y, other.end.y);
    return geq(thisMaxX, otherMinX)
        && geq(otherMaxX, thisMinX)
        && geq(thisMaxY, otherMinY)
        && geq(otherMaxY, thisMinY)
        && isNonPositive(this.start.times(other.start, this.end)
                       * this.start.times(other.end, this.end))
        && isNonPositive(other.start.times(this.start, other.end)
                       * other.start.times(this.end, other.end));
  }

  /**
   * Calculates the intersection point of this line and another specified line.
   *
   * @param {Line} l
   *     Another specified line.
   * @return {Point|string}
   *     Returns the intersection point if this line intersects with the other
   *     line; returns the string 'online' if the lines are collinear; returns
   *     the string 'parallel' if the lines are parallel.
   */
  crossPointWithLine(l) {
    const a1 = this.end.y - this.start.y;
    const b1 = this.start.x - this.end.x;
    const c1 = this.end.x * this.start.y - this.start.x * this.end.y;
    const a2 = l.end.y - l.start.y;
    const b2 = l.start.x - l.end.x;
    const c2 = l.end.x * l.start.y - l.start.x * l.end.y;
    if (eq(a1 * b2, a2 * b1)) {
      if (eq(a1 * c2, a2 * c1) && eq(b1 * c2, b2 * c1)) { // 共线
        return 'online';
      } else {    // 平行
        return 'parallel';
      }
    } else {      // 相交
      const x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
      const y = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1);
      return new Point(x, y);
    }
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

export default Line;
