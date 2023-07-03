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
   * @param {LineSegment} l
   *     Another line segment.
   * @return {number}
   *     The angle between this line and the other line segment, in radians.
   */
  angleWithLineSegment(l) {
    const u = this.end.subtract(this.start);
    const v = l.end.subtract(l.start);
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
   * @param {LineSegment} l
   *     The specified line segment.
   * @return {number}
   *     The shortest distance from this line to the specified line segment.
   */
  distanceToLineSegment(l) {
    return l.distanceToLine(this);
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
   * Rotates this line around a specified point by a specified angle.
   *
   * @param {Point} o
   *    The specified point.
   * @param {number} angle
   *    The angle of rotation in radians.
   * @return {Line}
   *    A new `Line` object representing the line rotated from this line.
   */
  rotateAround(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const newStart = this.start.rotateAroundImpl(o, sin, cos);
    const newEnd = this.start.rotateAroundImpl(o, sin, cos);
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
   * Checks if this line is equal to another line.
   *
   * Note that a line is equal to another line if and only if they are collinear.
   *
   * @param {Line} other
   *    Another line.
   * @return {boolean}
   *    `true` if this line is equal to the other line, `false` otherwise.
   */
  equals(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    if (isZero(u.cross(v))) {  // this line is parallel or collinear with other line
      const w = this.start.subtract(other.start);
      return isZero(w.cross(v));
    } else {
      return false;
    }
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
   *     - `'equal'`: indicates this line equals the other line, i.e., they are
   *       collinear;
   *     - `'parallel'`: indicates this line is parallel with the other line;
   *     - `'intersect'`: indicates this line intersects with the other line.
   * @see equals
   * @see parallelWith
   * @see intersectsWith
   */
  relationTo(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    if (isZero(u.cross(v))) {      // this line is parallel or collinear with other line
      const w = this.start.subtract(other.start);
      if (isZero(w.cross(v))) {
        return 'equal';
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
  parallelWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    return isZero(u.cross(v));
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
   * @see parallelWith
   */
  intersectsWith(other) {
    const u = this.end.subtract(this.start);
    const v = other.end.subtract(other.start);
    return isNonZero(u.cross(v));
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
