////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import Config from './Config';
import { eq, geq, leq, isZero, sign } from './Utils';

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
    this.x = x;                 // x-coordinate
    this.y = y;                 // y-coordinate
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
   * Calculates the point obtained by adding an offset to this point.
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
   * Rotates this point by a given angle around a given point.
   *
   * @param {Point} o
   *     The point around which the rotation is performed.
   * @param {number} angle
   *     The angle of rotation, in radians.
   * @return {Point}
   *     A new `Point` object representing the ending position after rotating
   *     this point around the given point by the given angle.
   */
  rotate(o, angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    return this.rotateImpl(o, sin, cos);
  }

  /**
   * Rotates this point by a given angle around a given point.
   *
   * @param {Point} o
   *     The point around which the rotation is performed.
   * @param {number} sin
   *     The sine of the rotation angle.
   * @param {number} cos
   *     The cosine of the rotation angle.
   * @return {Point}
   *     A new `Point` object representing the ending position after rotating
   *     this point around the given point by the given angle.
   */
  rotateImpl(o, sin, cos) {
    const dx = this.x - o.x;
    const dy = this.y - o.y;
    return new Point(o.x + dx * cos - dy * sin, o.y + dx * sin + dy * cos);
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
   * The function will compare the x-coordinates of the two points firstly, and
   * the compare the y-coordinates of the two points.
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
      return (this.x < p.x ? -1 : +1);
    } else if (!eq(this.y, p.y)) {
      return (this.y < p.y ? -1 : +1);
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
   * @see distanceToLine
   * @see distanceToLineSegment
   */
  distanceTo(other) {
    const a = this.x - other.x;
    const b = this.y - other.y;
    return Math.sqrt(a * a + b * b);
  }

  /**
   * Computes the distance between this point and a specified line.
   *
   * @param {Line} l
   *     The specified line.
   * @returns {number}
   *     The distance between this point and the specified line.
   * @see distanceTo
   * @see distanceToLineSegment
   */
  distanceToLine(l) {
    const u = this.subtract(l.start);
    const v = l.end.subtract(l.start);
    return Math.abs(u.cross(v)) / v.norm();
  }

  /**
   * Computes the distance between this point and a specified line segment.
   *
   * @param {LineSegment} l
   *     The specified line segment.
   * @returns {number}
   *     The distance between this point and the specified line segment.
   * @see distanceTo
   * @see distanceToLine
   */
  distanceToLineSegment(l) {
    const u = l.end.subtract(l.start);
    const v = this.subtract(l.start);
    const r = u.dot(v);
    if (r <= 0) {       // the projection of p is on the backward extension of l
      return this.distanceTo(l.start);
    }
    const w = u.dot(u);
    if (geq(r, w)) {    // the projection of p is on the forward extension of l
      return this.distanceTo(l.end);
    } else {            // the projection of p is between the line segment endpoints
      return Math.abs(u.cross(v)) / Math.sqrt(w);
    }
  }

  /**
   * Determines whether this point lies on a specified line.
   *
   * @param {Line|LineSegment} l
   *    The specified line (or line segment, which will be treated as a line).
   * @return {boolean}
   *    `true` if this point lies on the specified line, `false` otherwise.
   */
  isOnLine(l) {
    const u = l.end.subtract(l.start);
    const v = this.subtract(l.start);
    const r = u.cross(v);
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
    const u = l.end.subtract(l.start);
    const v = this.subtract(l.start);
    const w = this.subtract(l.end);
    const r = u.cross(v);
    return isZero(r)
        && (sign(v.x) * sign(w.x) <= 0)
        && (sign(v.y) * sign(w.y) <= 0);
  }

  /**
   * Computes the relationship between this point and a specified line.
   *
   * @param {Line|LineSegment} l
   *     The specified line (or line segment, which will be treated as a line).
   * @return {string}
   *     The relationship between this point and the specified line. It can have
   *     the following possible values:
   *     - 'on': indicates that this point lies on the specified line;
   *     - 'left': indicates that this point is on the left side of the specified line;
   *     - 'right': indicates that this point is on the right side of the specified line.
   */
  relationToLine(l) {
    const u = l.end.subtract(l.start);
    const v = this.subtract(l.start);
    const r = u.cross(v);
    if (isZero(r)) {
      return 'on';
    } else {
      return (r > 0 ? 'left' : 'right');
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
   * Tests whether this point is inside a specified triangle.
   *
   * @param {Triangle} triangle
   *     The specified triangle.
   * @return {boolean}
   *    `true` if this point is inside the specified triangle, `false` otherwise.
   */
  isInsideTriangle(triangle) {
    return (this.relationToTriangle(triangle) === 'inside');
  }

  /**
   * Tests whether this point is on the side of a specified triangle.
   *
   * @param {Triangle} triangle
   *     The specified triangle.
   * @return {boolean}
   *    `true` if this point is on the side of the specified triangle, `false`
   *    otherwise.
   */
  isOnTriangle(triangle) {
    return (this.relationToTriangle(triangle) === 'on');
  }

  /**
   * Tests whether this point is outside a specified triangle.
   *
   * @param {Triangle} triangle
   *     The specified triangle.
   * @return {boolean}
   *    `true` if this point is outside the specified triangle, `false` otherwise.
   */
  isOutsideTriangle(triangle) {
    return (this.relationToTriangle(triangle) === 'outside');
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
      if (this.isOnLineSegment(sides[i])) {
        return 'on';
      } else if (this.relationToLine(sides[i]) !== relation) {
        return 'outside';
      }
    }
    return 'inside';
  }

  /**
   * Tests whether this point is exactly inside a specified rectangle.
   *
   * @param {Rectangle} rectangle
   *    The specified rectangle.
   * @return {boolean}
   *    `true` if this point is exactly inside the specified rectangle, `false`
   *    otherwise. Note that if this point lies exactly on a side of the specified
   *    rectangle, this function will return `false`.
   */
  isInsideRectangle(rectangle) {
    return (this.relationToRectangle(rectangle) === 'inside');
  }

  /**
   * Tests whether this point is on the side of a specified rectangle.
   *
   * @param {Rectangle} rectangle
   *    The specified rectangle.
   * @return {boolean}
   *    `true` if this point is on the side of the specified rectangle, `false`
   *    otherwise.
   */
  isOnRectangle(rectangle) {
    return (this.relationToRectangle(rectangle) === 'on');
  }

  /**
   * Tests whether this point is exactly outside a specified rectangle.
   *
   * @param {Rectangle} rectangle
   *    The specified rectangle.
   * @return {boolean}
   *    `true` if this point is exactly outside the specified rectangle, `false`
   *    otherwise. Note that if this point lies exactly on a side of the specified
   *    rectangle, this function will return `false`.
   */
  isOutsideRectangle(rectangle) {
    return (this.relationToRectangle(rectangle) === 'outside');
  }

  /**
   * Computes the relationship between this point and a specified rectangle.
   *
   * @param {Rectangle} rectangle
   *    The specified rectangle, which may or may not be parallel to the x-y axes.
   * @return {string}
   *    The relationship between this point and the specified rectangle. It can
   *    be the following possible values:
   *    - 'inside': indicates that this point is inside the specified rectangle;
   *    - 'outside': indicates that this point is outside the specified rectangle;
   *    - 'on': indicates that this point lies on one of the edges of the
   *      specified rectangle.
   */
  relationToRectangle(rectangle) {
    if (rectangle.isParallelToAxis()) {
      if (geq(this.x, rectangle.left)
          && leq(this.x, rectangle.right)
          && geq(this.y, Math.min(rectangle.bottom, rectangle.top))
          && leq(this.y, Math.max(rectangle.bottom, rectangle.top))) {
        if (eq(this.x, rectangle.left)
            || eq(this.x, rectangle.right)
            || eq(this.y, rectangle.top)
            || eq(this.y, rectangle.bottom)) {
          return 'on';
        } else {
          return 'inside';
        }
      } else {
        return 'outside';
      }
    } else {
      const sides = rectangle.sides();
      for (let i = 0; i < 4; ++i) {
        const s = sides[i];
        const u = s.end.subtract(s.start);
        const v = this.subtract(s.start);
        const w = this.subtract(s.end);
        const r = u.cross(v);
        if (isZero(r)) {
          if ((sign(v.x) * sign(w.x) <= 0) && (sign(v.y) * sign(w.y) <= 0)) {
            // this point is on the side "s" of the rectangle
            return 'on';
          } else {
            // this point is on the same line of "s" but not inside "s"
            return 'outside';
          }
        } else if (r > 0) {
          // this point is on the left side of "s"
          return 'outside';
        }
      }
      return 'inside';
    }
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
    return (this.relationToConvex(convex) === 'inside');
  }

  /**
   * Tests whether this point is on the side of a specified convex.
   *
   * @param {Polygon} convex
   *    The specified convex.
   * @return {boolean}
   *    `true` if this point is on the side of the specified convex, `false`
   *    otherwise.
   */
  isOnConvex(convex) {
    return (this.relationToConvex(convex) === 'on');
  }

  /**
   * Tests whether this point is exactly outside a specified convex.
   *
   * @param {Polygon} convex
   *    The specified convex.
   * @return {boolean}
   *    `true` if this point is exactly outside the specified convex, `false`
   *    otherwise. Note that if this point lies exactly on a side of the specified
   *    convex, this function will return `false`.
   */
  isOutsideConvex(convex) {
    return (this.relationToConvex(convex) === 'outside');
  }

  /**
   * Computes the relationship between this point and a specified convex polygon.
   *
   * @param {Polygon} convex
   *    The specified polygon, which must be a convex. If it is not a convex,
   *    the returned value of this function may not correct.
   * @return {string}
   *    The relationship between this point and the specified convex polygon. It
   *    can be the following possible values:
   *    - 'inside': indicates that this point is inside the specified convex polygon;
   *    - 'outside': indicates that this point is outside the specified convex polygon;
   *    - 'on': indicates that this point lies on one of the edges of the
   *      specified convex polygon.
   */
  relationToConvex(convex) {
    const n = convex.size();
    if (n < 3) {
      throw new Error('The specified polygon must have at least 3 vertexes.');
    }
    const vertexes = convex.vertexes();
    let q_x = 0;
    let q_y = 0;
    for (let i = 0; i < n; ++i) {
      q_x += vertexes[i].x;
      q_y += vertexes[i].y;
    }
    q_x /= n;
    q_y /= n;
    const sides = convex.sides();
    const q = new Point(q_x, q_y);
    for (let i = 0; i < n; ++i) {
      const side = sides[i];
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
    return (this.relationToPolygon(polygon) === 'inside');
  }

  /**
   * Tests whether this point is on the side of a specified polygon.
   *
   * @param {Polygon} polygon
   *    The specified polygon.
   * @return {boolean}
   *    `true` if this point is on the side of the specified polygon, `false`
   *    otherwise.
   */
  isOnPolygon(polygon) {
    return (this.relationToPolygon(polygon) === 'on');
  }

  /**
   * Tests whether this point is exactly outside a specified polygon.
   *
   * @param {Polygon} polygon
   *    The specified polygon.
   * @return {boolean}
   *    `true` if this point is exactly outside the specified polygon, `false`
   *    otherwise. Note that if this point lies exactly on a side of the specified
   *    polygon, this function will return `false`.
   */
  isOutsidePolygon(polygon) {
    return (this.relationToPolygon(polygon) === 'outside');
  }

  /**
   * Computes the relationship between this point and a specified polygon.
   *
   * @param {Polygon} polygon
   *    The specified polygon.
   * @return {string}
   *    The relationship between this point and the specified polygon. It can
   *    be the following possible values:
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
      end: new Point(Config.NEGATIVE_INF, this.y),
    };
    const sides = polygon.sides();
    const n = polygon.size();
    for (let i = 0; i < n; ++i) {
      const side = sides[i];
      if (this.isOnLineSegment(side)) {
        return 'on';
      }
      if (eq(side.start.y, side.end.y)) {
        // This side is parallel to the X-axis.
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
      } else if (side.intersectsWith(ray)) {
        ++c;
      }
    }
    return (c % 2 === 1 ? 'inside' : 'outside');
  }
}

export default Point;
