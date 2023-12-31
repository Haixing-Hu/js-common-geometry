/******************************************************************************
 *                                                                            *
 *    Copyright (c) 2023.                                                     *
 *    Haixing Hu                                                              *
 *                                                                            *
 *    All rights reserved.                                                    *
 *                                                                            *
 ******************************************************************************/
import Config from './Config';
import { eq, isNonPositive, isZero } from './Utils';

/**
 * This class represents a point or a vector in a plane.
 *
 * This class is immutable.
 *
 * @author Haixing Hu
 */
class Point {
  /**
   * Constructs a point.
   *
   * @param {number} x
   *    The x-coordinate of the point.
   * @param {number} y
   *    The y-coordinate of the point.
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    Object.freeze(this);        // make this object immutable
  }

  /**
   * Tests whether this point is the origin, i.e., its x-coordinate and
   * y-coordinate are both zero.
   *
   * @return {boolean}
   *    `true` if this point is the origin; `false` otherwise.
   */
  isOrigin() {
    return isZero(this.x) && isZero(this.y);
  }

  /**
   * alculates the point obtained by adding an offset to this point.
   *
   * @param {Point} off
   *    The offset to be added, represented by a Point object o, where o.x
   *    represents the offset of the x-coordinate and o.y represents the offset
   *    of the y-coordinate.
   * @return {Point}
   *    A new `Point` object representing the point obtained by adding the
   *    offset to this point.
   */
  add(off) {
    return new Point(this.x + off.x, this.y + off.y);
  }

  /**
   * Calculates the point obtained by subtracting an offset from this point.
   *
   * @param {Point} off
   *    The offset to be subtracted, represented by a Point object o, where o.x
   *    represents the offset of the x-coordinate and o.y represents the offset
   *    of the y-coordinate.
   * @return {Point}
   *    A new `Point` object representing the point obtained by subtracting the
   *    offset from this point.
   */
  subtract(off) {
    return new Point(this.x - off.x, this.y - off.y);
  }

  /**
   * Calculates the cross product of the vector represented by this point and
   * the vector represented by another point.
   *
   * @param {Point} p
   *    Another point.
   * @return {number}
   *    The cross product of this point and another point.
   */
  cross(p) {
    return this.x * p.y - this.y * p.x;
  }

  /**
   * Calculates the dot product of the vector represented by this point and the
   * vector represented by another point.
   *
   * @param {Point} p
   *    Another point.
   * @return {number}
   *    The dot product of this point and another point.
   */
  dot(p) {
    return this.x * p.x + this.y * p.y;
  }

  /**
   * Calculates the magnitude of the vector represented by this object, which is
   * the Euclidean distance from this point to the origin of the coordinate
   * system.
   *
   * @return {number}
   *     The magnitude of this point.
   */
  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Calculates the angle of the vector represented by this object, which is the
   * angle between the vector represented by this point and the x-axis of the
   * coordinate system.
   *
   * @return {number}
   *     The angle between the vector represented by this object and the x-axis,
   *     in radians.
   */
  angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Calculates the angle between the vector represented by this point and the
   * vector represented by another point.
   *
   * @param {Point} p
   *     Another point.
   */
  angleWith(p) {
    return Math.acos(this.dot(p) / (this.norm() * p.norm()));
  }

  /**
   * Calculates the vector obtained by rotating the vector represented by this
   * point by a given angle.
   *
   * @param {number} angle
   *     The angle of rotation, in radians.
   * @return {Point}
   *     A new `Point` object representing the vector obtained by rotating the
   *     vector represented by this point by the given angle.
   */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Point(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  /**
   * Rotates this point by a given angle around a given point.
   *
   * @param {Point} p
   *     The point around which the rotation is performed.
   * @param {number} angle
   *     The angle of rotation, in radians.
   * @return {Point}
   *     A new `Point` object representing the ending position after rotating
   *     this point around the given point by the given angle.
   */
  rotateAround(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x - p.x;
    const y = this.y - p.y;
    return new Point(p.x + x * cos - y * sin, p.y + x * sin + y * cos);
  }

  /**
   * Calculates the cross product of the two vectors starting from this point,
   * i.e., `(p1 - p0) × (p2 - p0)`, where `p0` is this point.
   *
   * @param {Point} p1
   *    The endpoint of the first vector.
   * @param {Point} p2
   *    The endpoint of the second vector.
   * @return {number}
   *    The cross product of the two vectors starting from this point, i.e.,
   *    `(p1 - p0) × (p2 - p0)`, where `p0` is this point.
   */
  times(p1, p2) {
    return (p1.x - this.x) * (p2.y - this.y) - (p1.y - this.y) * (p2.x - this.x);
  }

  /**
   * Checks if this point is equal to another point.
   *
   * @param {Point} p
   *    Another point.
   * @return {boolean}
   *    `true` if this point is equal to the other point, `false` otherwise.
   */
  equals(p) {
    return eq(this.x, p.x) && eq(this.y, p.y);
  }

  /**
   * Compares this point with another point.
   *
   * @param {Point} p
   *     Another point.
   * @return {number}
   *     A negative value if this point is less than the other point, a positive
   *     value if this point is greater than the other point, or zero if this
   *     point equals the other point.
   */
  compareTo(p) {
    if (!eq(this.x, p.x)) {
      return Math.sign(this.x - p.x);
    } else if (!eq(this.y, p.y)) {
      return Math.sign(this.y - p.y);
    } else {
      return 0;
    }
  }

  /**
   * Calculates the Euclidean distance between this point and another point.
   *
   * @param other
   *    Another point.
   * @return {number}
   *    The Euclidean distance between this point and another point.
   */
  distance(other) {
    const a = this.x - other.x;
    const b = this.y - other.y;
    return Math.sqrt(a * a + b * b);
  }

  /**
   * Determines whether this point lies on a specified line.
   *
   * @param {Line} l
   *    The specified line.
   * @return {boolean}
   *    `true` if this point lies on the specified line, `false` otherwise.
   */
  isOnLine(l) {
    const r = (l.end.x - l.start.x) * (this.y - l.start.y)
            - (l.end.y - l.start.y) * (this.x - l.start.x);
    return isZero(r);
  }

  /**
   * Determines whether this point lies on a specified line segment.
   *
   * @param {Line} l
   *    The specified line segment.
   * @return {boolean}
   *    `true` if this point lies on the specified line segment, `false` otherwise.
   */
  isOnLineSegment(l) {
    const r = (l.end.x - l.start.x) * (this.y - l.start.y)
            - (l.end.y - l.start.y) * (this.x - l.start.x);
    return isZero(r)
        && isNonPositive((this.x - l.start.x) * (this.x - l.end.x))
        && isNonPositive((this.y - l.start.y) * (this.y - l.end.y));
  }

  /**
   * Computes the relationship between this point and a specified line.
   *
   * @param {Line} l
   *     The specified line.
   * @return {string}
   *     The relationship between this point and the specified line. It can have
   *     the following possible values:
   *     - 'on': indicates that this point lies on the specified line;
   *     - 'left': indicates that this point is on the left side of the specified line;
   *     - 'right': indicates that this point is on the right side of the specified line.
   */
  relationToLine(l) {
    const r = (l.end.x - l.start.x) * (this.y - l.start.y)
            - (l.end.y - l.start.y) * (this.x - l.start.x);
    if (isZero(r)) {
      return 'on';
    } else {
      return r > 0 ? 'left' : 'right';
    }
  }

  /**
   * Computes the symmetric point of this point with respect to a specified line.
   *
   * @param {Line} l
   *     The specified line.
   * @return {Point}
   *     The symmetric point of this point with respect to the specified line.
   */
  symmetryPointToLine(l) {
    const a = l.end.x - l.start.x;
    const b = l.end.y - l.start.y;
    const t = (a * (this.x - l.start.x) + b * (this.y - l.start.y)) / (a * a + b * b);
    const x = 2 * l.start.x + 2 * a * t - this.x;
    const y = 2 * l.start.y + 2 * b * t - this.y;
    return new Point(x, y);
  }

  /**
   * Computes the distance between this point and a specified line.
   *
   * @param {Line} l
   *     The specified line.
   * @returns {number}
   *     The distance between this point and the specified line.
   */
  distanceToLine(l) {
    const a_x = this.x - l.start.x;
    const a_y = this.y - l.start.y;
    const b_x = l.end.x - l.start.x;
    const b_y = l.end.y - l.start.y;
    return Math.abs(a_x * b_y - a_y * b_x) / Math.sqrt(b_x * b_x + b_y * b_y);
  }

  /**
   * Computes the nearest point on a specified line from this point, which is
   * the perpendicular projection of this point onto the specified line.
   *
   * @param {Line} l
   *     The specified line.
   * @return {Point}
   *     The nearest point on the specified line from this point, which is the
   *     perpendicular projection of this point onto the specified line.
   */
  nearestPointToLine(l) {
    const a = l.end.x - l.start.x;
    const b = l.end.y - l.start.y;
    const t = (a * (this.x - l.start.x) + b * (this.y - l.start.y)) / (a * a + b * b);
    return new Point(l.start.x + a * t, l.start.y + b * t);
  }

  /**
   * Tests whether this point is inside a specified triangle.
   *
   * @param {Triangle} triangle
   *     The specified triangle.
   * @return {boolean}
   *    `true` if this point is inside the specified triangle, `false` otherwise.
   */
  isInsideTriangle(triangle) {
    return this.relationToTriangle(triangle) === 'inside';
  }

  /**
   * Computes the relationship between this point and a specified triangle.
   *
   * @param {Triangle} triangle
   *    The specified triangle.
   * @return {string}
   *    The relationship between this point and the specified triangle. It can
   *    have the following possible values:
   *    - 'inside': indicates that this point is inside the specified triangle;
   *    - 'outside': indicates that this point is outside the specified triangle;
   *    - 'on': indicates that this point lies on one of the edges of the
   *       specified triangle.
   */
  relationToTriangle(triangle) {
    const center = triangle.center();
    const sides = triangle.sides();
    const relation = center.relationToLine(sides[0]);
    for (let i = 0; i < 3; ++i) {
      if (p.isOnLineSegment(sides[i])) {
        return 'on';
      } else if (p.relationToLine(sides[i]) !== relation) {
        return 'outside';
      }
    }
    return 'inside';
  }

  /**
   * Tests whether this point is inside a specified rectangle.
   *
   * @param {Rectangle} rectangle
   *    The specified rectangle.
   * @return {boolean}
   *    `true` if this point is inside the specified rectangle, `false` otherwise.
   */
  isInsideRectangle(rectangle) {
    return geq(this.x, rectangle._topLeft.x)
        && leq(this.x, rectangle._bottomRight.x)
        && geq(this.y, rectangle._topLeft.y)
        && leq(this.y, rectangle._bottomRight.y);
  }

  /**
   * Tests whether this point is inside a specified convex polygon.
   *
   * @param {Polygon} convex
   *     The specified polygon, which must be a convex. If it is not a convex,
   *    the returned value of this function may not correct.
   * @return {boolean}
   *    `true` if this point is inside the specified convex polygon, `false`
   *    otherwise.
   */
  isInsideConvex(convex) {
    return this.relationToConvex(convex) === 'inside';
  }

  /**
   * Computes the relationship between this point and a specified convex polygon.
   *
   * @param {Polygon} convex
   *    The specified polygon, which must be a convex. If it is not a convex,
   *    the returned value of this function may not correct.
   * @return {string}
   *    The relationship between this point and the specified convex polygon. It
   *    can have the following possible values:
   *    - 'inside': indicates that this point is inside the specified convex polygon;
   *    - 'outside': indicates that this point is outside the specified convex polygon;
   *    - 'on': indicates that this point lies on one of the edges of the
   *      specified convex polygon.
   */
  relationToConvex(convex) {
    const n = convex.vertexes.length;
    if (n < 3) {
      throw new Error('The specified polygon must have at least 3 vertexes.');
    }
    const q = new Point(0, 0);
    for (let i = 0; i < n; ++i) {
      q.x += convex.vertexes[i].x;
      q.y += convex.vertexes[i].y;
    }
    q.x /= n;
    q.y /= n;
    for (let i = 0; i < n; ++i) {
      const side = convex.side(i);
      if (this.isOnLineSegment(side)) {
        return 'on';
      } else if (this.relationToLine(side) !== q.relationToLine(side)) {
        return 'outside';
      }
    }
    return 'inside';
  }

  /**
   * Tests whether this point is inside a specified polygon.
   *
   * @param {Polygon} polygon
   *     The specified polygon.
   * @return {boolean}
   *    `true` if this point is inside the specified polygon, `false` otherwise.
   */
  isInsidePolygon(polygon) {
    return this.relationToPolygon(polygon) === 'inside';
  }

  /**
   * Computes the relationship between this point and a specified polygon.
   *
   * @param {Polygon} polygon
   *    The specified polygon.
   * @return {string}
   *    The relationship between this point and the specified polygon. It can
   *    have the following possible values:
   *    - 'inside': indicates that this point is inside the specified polygon;
   *    - 'outside': indicates that this point is outside the specified polygon;
   *    - 'on': indicates that this point lies on one of the edges of the
   *      specified polygon.
   */
  relationToPolygon(polygon) {
    let c = 0;
    // `ray` is a horizontal ray, starting from this point and pointing to the
    // negative infinity.
    const ray = {
      start: this,
      end: new Point(- Config.INF, this.y),
    };
    const n = polygon.vertexes.length;
    for (let i = 0; i < n; ++i) {
      const side = polygon.side(i);
      if (this.isOnLineSegment(side)) {
        return 'on';
      }
      if (eq(side.start.y, side.end.y)) {
        // This side is parallel to the X ray.
        continue;
      }
      if (side.start.isOnLineSegment(ray)) {
        if (side.start.y > side.end.y) {
          ++c;
        }
      } else if (side.end.isOnLineSegment(ray)) {
        if (side.end.y > side.start.y) {
          ++c;
        }
      } else if (side.isIntersectWithLineSegment(ray)) {
        ++c;
      }
    }
    return (c % 2 === 1 ? 'inside' : 'outside');
  }
}

export default Point;
